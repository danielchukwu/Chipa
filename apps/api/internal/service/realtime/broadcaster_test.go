package realtime

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNoOpBroadcaster(t *testing.T) {
	b := NewNoOpBroadcaster()
	ctx := context.Background()

	err := b.BroadcastToUser(ctx, "usr_123", EventTransactionUpdated, map[string]string{"status": "completed"})
	assert.NoError(t, err)

	err = b.BroadcastToUser(ctx, "usr_123", EventWalletUpdated, map[string]interface{}{"balance": 5000})
	assert.NoError(t, err)
}

func TestNewBroadcasterFromEnv_NoEnv(t *testing.T) {
	// Without env set, should safely return NoOpBroadcaster
	b := NewBroadcasterFromEnv()
	assert.NotNil(t, b)
	_, ok := b.(*NoOpBroadcaster)
	assert.True(t, ok)
}
