package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"chipa/api/internal/config"
	"chipa/api/internal/db"
	"chipa/api/internal/db/queries"
	"chipa/api/internal/logger"
	"chipa/api/internal/router"
	"chipa/api/internal/service/realtime"
	"chipa/api/internal/worker"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

// @title Chipa API
// @version 1.0
// @description Multi-currency fintech API for Chipa platform.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:4100
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer " followed by your access token.

// @securityDefinitions.apikey RefreshToken
// @in header
// @name RefreshToken
// @description Type your refresh token.

type App struct {
	cfg       *config.Config
	server    *http.Server
	db        *pgxpool.Pool
	rdb       *redis.Client
	processor worker.TaskProcessor
}

func newApp(ctx context.Context, cfg *config.Config) *App {
	// Setup structured logging
	// version and commit are located in version.go, but during production,
	// they will be added when building the app during ci/cd
	env := os.Getenv("ENV")
	if env == "" {
		env = "development"
	}
	logLevel := slog.LevelInfo
	if env == "development" {
		logLevel = slog.LevelDebug
	}

	logger.New(logger.Config{
		Service: "api",
		Env:     env,
		Version: version,
		Commit:  commit,
		Level:   logLevel,
	})

	// Initialize postgres database
	pool, err := db.NewPostgresPool(ctx, cfg.Database.URL)
	if err != nil {
		slog.Error("failed to initialize database", "err", err)
		os.Exit(1)
	}

	// Initialize Redis
	rdb, err := db.NewRedisClient(cfg.Redis)
	if err != nil {
		slog.Error("failed to initialize redis", "err", err)
		os.Exit(1)
	}

	// Initialize Asynq Redis Options
	redisOpt := asynq.RedisClientOpt{
		Addr:     cfg.Redis.Addr,
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	}

	// Initialize worker
	q := queries.New(pool)
	distributor := worker.NewRedisTaskDistributor(redisOpt)
	broadcaster := realtime.NewBroadcasterFromEnv()
	processor := worker.NewRedisTaskProcessor(redisOpt, q, pool, rdb, distributor, cfg, nil, broadcaster) // r2Svc will be passed after initialization

	// Initialize router
	r := router.New(cfg, pool, rdb, distributor)
	addr := fmt.Sprintf(":%s", cfg.Port)

	return &App{
		cfg:       cfg,
		db:        pool,
		rdb:       rdb,
		processor: processor,
		server: &http.Server{
			Addr:    addr,
			Handler: r,
		},
	}
}

func (a *App) Close() error {
	slog.Info("shutting down task processor")
	if a.processor != nil {
		a.processor.Shutdown()
	}

	slog.Info("closing all db connections")
	a.db.Close()
	a.rdb.Close()
	return nil
}

func (a *App) Run() error {
	slog.Info("starting server", "addr", a.server.Addr)

	if a.processor != nil {
		go func() {
			if err := a.processor.Start(); err != nil {
				slog.Error("task processor failed", "err", err)
			}
		}()
	}

	if err := a.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("server failed", "err", err)
		return fmt.Errorf("server failed, err: %w", err)
	}

	return nil
}

func main() {
	// loads the config
	cfg := config.Load()

	// Setup signal handling for graceful shutdown
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Initialize app
	app := newApp(context.Background(), cfg)

	// Start the server in a goroutine so that it doesn't block the main function
	go func() {
		if err := app.Run(); err != nil {
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal, e.g. Ctrl+C or docker container closes
	// When the program receives an interrupt signal,
	// the context's Done "channel" is closed, triggering this
	// goroutine to continue and shut down the server gracefully.
	<-ctx.Done()
	slog.Info("shutting down gracefully...")

	// 🔑 Add timeout for shutdown
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Proper HTTP shutdown
	if err := app.server.Shutdown(shutdownCtx); err != nil {
		slog.Error("server shutdown failed", "err", err)
	}

	// Close other resources (DB, Redis, etc.)
	if err := app.Close(); err != nil {
		slog.Error("app close failed", "err", err)
	}

	slog.Info("shutdown complete")
}
