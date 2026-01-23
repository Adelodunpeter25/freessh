package reconnect

import (
	"time"
)

type Config struct {
	InitialDelay time.Duration
	MaxDelay     time.Duration
	MaxAttempts  int
}

func DefaultConfig() Config {
	return Config{
		InitialDelay: 1 * time.Second,
		MaxDelay:     30 * time.Second,
		MaxAttempts:  10,
	}
}

type Backoff struct {
	config       Config
	attempt      int
	currentDelay time.Duration
}

func NewBackoff(config Config) *Backoff {
	return &Backoff{
		config:       config,
		attempt:      0,
		currentDelay: config.InitialDelay,
	}
}

func (b *Backoff) Next() (time.Duration, bool) {
	if b.config.MaxAttempts > 0 && b.attempt >= b.config.MaxAttempts {
		return 0, false
	}

	delay := b.currentDelay
	b.attempt++

	// Exponential backoff: double the delay
	b.currentDelay *= 2
	if b.currentDelay > b.config.MaxDelay {
		b.currentDelay = b.config.MaxDelay
	}

	return delay, true
}

func (b *Backoff) Reset() {
	b.attempt = 0
	b.currentDelay = b.config.InitialDelay
}

func (b *Backoff) Attempt() int {
	return b.attempt
}
