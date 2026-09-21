package realtime

import (
	"context"
	"log/slog"
	"os"
	"strings"

	"github.com/pusher/pusher-http-go/v5"
)

// Event name constants
const (
	EventTransactionUpdated = "transaction-updated"
	EventWalletUpdated      = "wallet-updated"
)

// Broadcaster is the interface for real-time WebSocket messaging.
type Broadcaster interface {
	BroadcastToUser(ctx context.Context, userPublicID string, eventName string, data interface{}) error
}

// PusherBroadcaster implements Broadcaster via Pusher protocol (works with Pusher SaaS and Soketi/Centrifugo).
type PusherBroadcaster struct {
	client *pusher.Client
}

// NewPusherBroadcaster creates a new Pusher broadcaster instance.
func NewPusherBroadcaster(client *pusher.Client) *PusherBroadcaster {
	return &PusherBroadcaster{client: client}
}

// BroadcastToUser broadcasts an event to a private user channel.
func (p *PusherBroadcaster) BroadcastToUser(ctx context.Context, userPublicID string, eventName string, data interface{}) error {
	if p.client == nil {
		return nil
	}

	channel := "private-user-" + userPublicID
	err := p.client.Trigger(channel, eventName, data)
	if err != nil {
		slog.Warn("Failed to broadcast pusher event", "channel", channel, "event", eventName, "err", err)
		return err
	}
	slog.Debug("Broadcasted pusher event", "channel", channel, "event", eventName)
	return nil
}

// NoOpBroadcaster is a fallback broadcaster that performs no operations (useful when Pusher is disabled/unconfigured).
type NoOpBroadcaster struct{}

func NewNoOpBroadcaster() *NoOpBroadcaster {
	return &NoOpBroadcaster{}
}

func (n *NoOpBroadcaster) BroadcastToUser(ctx context.Context, userPublicID string, eventName string, data interface{}) error {
	return nil
}

// NewBroadcasterFromEnv initializes a Broadcaster based on environment variables.
// If PUSHER_APP_ID or PUSHER_KEY is not configured, it safely returns a NoOpBroadcaster.
func NewBroadcasterFromEnv() Broadcaster {
	appID := strings.TrimSpace(os.Getenv("PUSHER_APP_ID"))
	key := strings.TrimSpace(os.Getenv("PUSHER_KEY"))
	secret := strings.TrimSpace(os.Getenv("PUSHER_SECRET"))
	cluster := strings.TrimSpace(os.Getenv("PUSHER_CLUSTER"))
	host := strings.TrimSpace(os.Getenv("PUSHER_HOST"))
	secureStr := strings.TrimSpace(os.Getenv("PUSHER_SECURE"))

	if appID == "" || key == "" || secret == "" {
		slog.Info("PUSHER_APP_ID/KEY/SECRET not set — using NoOpBroadcaster for WebSockets")
		return NewNoOpBroadcaster()
	}

	client := &pusher.Client{
		AppID:  appID,
		Key:    key,
		Secret: secret,
	}

	if cluster != "" {
		client.Cluster = cluster
	}

	if host != "" {
		client.Host = host
	}

	if secureStr == "false" || secureStr == "0" {
		client.Secure = false
	} else {
		client.Secure = true
	}

	slog.Info("Initialized Pusher real-time broadcaster", "app_id", appID, "cluster", cluster, "host", host)
	return NewPusherBroadcaster(client)
}
