package worker

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/hibiken/asynq"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/robfig/cron/v3"

	"chipa/api/internal/config"
	"chipa/api/internal/db/queries"
	r2service "chipa/api/internal/service/r2"
	"chipa/api/internal/service/realtime"
)

// TaskProcessor defines the interface for our Asynq workers.
type TaskProcessor interface {
	Start() error
	Shutdown()
	ProcessTaskSendEmail(ctx context.Context, task *asynq.Task) error
	ProcessTaskSendSMS(ctx context.Context, task *asynq.Task) error
}

type RedisTaskProcessor struct {
	server          *asynq.Server
	cron            *cron.Cron
	q               *queries.Queries
	pool            *pgxpool.Pool
	rdb             *redis.Client
	taskDistributor TaskDistributor
	cfg             *config.Config
	r2Svc           *r2service.R2Service
	broadcaster     realtime.Broadcaster
}

func NewRedisTaskProcessor(
	redisOpt asynq.RedisClientOpt,
	q *queries.Queries,
	pool *pgxpool.Pool,
	rdb *redis.Client,
	distributor TaskDistributor,
	cfg *config.Config,
	r2Svc *r2service.R2Service,
	broadcaster realtime.Broadcaster,
) TaskProcessor {
	if broadcaster == nil {
		broadcaster = realtime.NewNoOpBroadcaster()
	}

	server := asynq.NewServer(
		redisOpt,
		asynq.Config{
			Concurrency: 10,
			ErrorHandler: asynq.ErrorHandlerFunc(func(ctx context.Context, task *asynq.Task, err error) {
				slog.Error("process task failed", "type", task.Type(), "err", err)
			}),
		},
	)

	return &RedisTaskProcessor{
		server:          server,
		cron:            cron.New(),
		q:               q,
		pool:            pool,
		rdb:             rdb,
		taskDistributor: distributor,
		cfg:             cfg,
		r2Svc:           r2Svc,
		broadcaster:     broadcaster,
	}
}

func (processor *RedisTaskProcessor) Start() error {
	mux := asynq.NewServeMux()
	mux.HandleFunc(TaskSendEmail, processor.ProcessTaskSendEmail)
	mux.HandleFunc(TaskSendSMS, processor.ProcessTaskSendSMS)

	processor.cron.Start()
	slog.Info("Chipa worker scheduler started")

	return processor.server.Start(mux)
}

func (processor *RedisTaskProcessor) ProcessTaskSendEmail(ctx context.Context, task *asynq.Task) error {
	var payload SendEmailPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal email payload: %w", err)
	}

	slog.Info("Processing email dispatch", "to", payload.To, "subject", payload.Subject)
	// Dispatch via Resend/Sendgrid/Termii
	return nil
}

func (processor *RedisTaskProcessor) ProcessTaskSendSMS(ctx context.Context, task *asynq.Task) error {
	var payload SendSMSPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return fmt.Errorf("unmarshal sms payload: %w", err)
	}

	slog.Info("Processing SMS dispatch", "to", payload.To)
	// Dispatch via Termii/Twilio
	return nil
}

func (processor *RedisTaskProcessor) Shutdown() {
	processor.cron.Stop()
	processor.server.Shutdown()
}
