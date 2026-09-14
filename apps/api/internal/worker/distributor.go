package worker

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
)

// Task names for Chipa background jobs
const (
	TaskSendEmail                 = "notification:email"
	TaskSendSMS                   = "notification:sms"
	TaskReconcileLedger           = "ledger:reconcile"
	TaskProcessWebhookEvent       = "webhook:process"
)

type TaskDistributor interface {
	DistributeTaskSendEmail(ctx context.Context, payload *SendEmailPayload, opts ...asynq.Option) error
	DistributeTaskSendSMS(ctx context.Context, payload *SendSMSPayload, opts ...asynq.Option) error
}

type RedisTaskDistributor struct {
	client *asynq.Client
}

func NewRedisTaskDistributor(redisOpt asynq.RedisClientOpt) TaskDistributor {
	client := asynq.NewClient(redisOpt)
	return &RedisTaskDistributor{client: client}
}

type SendEmailPayload struct {
	To      string `json:"to"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

type SendSMSPayload struct {
	To      string `json:"to"`
	Message string `json:"message"`
}

func (distributor *RedisTaskDistributor) DistributeTaskSendEmail(ctx context.Context, payload *SendEmailPayload, opts ...asynq.Option) error {
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal email payload: %w", err)
	}

	task := asynq.NewTask(TaskSendEmail, jsonPayload, opts...)
	_, err = distributor.client.EnqueueContext(ctx, task)
	if err != nil {
		return fmt.Errorf("enqueue email task: %w", err)
	}

	return nil
}

func (distributor *RedisTaskDistributor) DistributeTaskSendSMS(ctx context.Context, payload *SendSMSPayload, opts ...asynq.Option) error {
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal sms payload: %w", err)
	}

	task := asynq.NewTask(TaskSendSMS, jsonPayload, opts...)
	_, err = distributor.client.EnqueueContext(ctx, task)
	if err != nil {
		return fmt.Errorf("enqueue sms task: %w", err)
	}

	return nil
}
