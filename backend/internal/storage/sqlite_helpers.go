package storage

import "time"

const sqliteTimeLayout = "2006-01-02 15:04:05"

func nullIfEmpty(value string) interface{} {
	if value == "" {
		return nil
	}
	return value
}

func formatTime(value time.Time) interface{} {
	if value.IsZero() {
		return nil
	}
	return value.Format(sqliteTimeLayout)
}

func parseTime(value string) (time.Time, error) {
	if value == "" {
		return time.Time{}, nil
	}
	return time.ParseInLocation(sqliteTimeLayout, value, time.Local)
}
