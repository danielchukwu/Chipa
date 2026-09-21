package router_test

import (
	"context"
	"chipa/api/internal/db"
	"chipa/api/internal/router"
	"chipa/api/test"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"chipa/api/internal/utils"

	"github.com/stretchr/testify/require"
)

func TestNewRouter(t *testing.T) {
	cfg, _ := test.BeforeEach(t)
	defer test.AfterEach(t)

	// Initialize database
	pool, err := db.NewPostgresPool(context.Background(), cfg.Database.URL)
	if err != nil {
		t.Skipf("skipping router test: database connection failed: %v", err)
		return
	}
	defer pool.Close()

	// Initialize Redis
	rdb, err := db.NewRedisClient(cfg.Redis)
	if err != nil {
		slog.Error("failed to initialize redis", "err", err)
		os.Exit(1)
	}
	defer rdb.Close()

	// Initialize router (passing nil for TaskDistributor in tests)
	r := router.New(cfg, pool, rdb, nil)

	req := httptest.NewRequest(http.MethodGet, utils.ApiUrls.Health, nil)
	rec := httptest.NewRecorder()

	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)

	require.NotNil(t, r)
}
