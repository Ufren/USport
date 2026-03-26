package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server ServerConfig `mapstructure:"server"`
	DB     DBConfig     `mapstructure:"db"`
	Redis  RedisConfig  `mapstructure:"redis"`
	JWT    JWTConfig    `mapstructure:"jwt"`
	Admin  AdminConfig  `mapstructure:"admin"`
	Wechat WechatConfig `mapstructure:"wechat"`
	Log    LogConfig    `mapstructure:"log"`
}

type ServerConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type DBConfig struct {
	Host         string `mapstructure:"host"`
	Port         int    `mapstructure:"port"`
	User         string `mapstructure:"user"`
	Password     string `mapstructure:"password"`
	Name         string `mapstructure:"name"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
	ConnMaxLife  int    `mapstructure:"conn_max_life"`
}

type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
	PoolSize int    `mapstructure:"pool_size"`
}

type JWTConfig struct {
	Secret string `mapstructure:"secret"`
	Expire int    `mapstructure:"expire"`
}

type AdminConfig struct {
	Token string `mapstructure:"token"`
}

type WechatConfig struct {
	Appid  string `mapstructure:"appid"`
	Secret string `mapstructure:"secret"`
}

type LogConfig struct {
	Level    string `mapstructure:"level"`
	Encoding string `mapstructure:"encoding"`
}

func Load() *Config {
	configurator := viper.New()
	configurator.SetConfigName("config")
	configurator.SetConfigType("yaml")
	configurator.AddConfigPath(".")
	configurator.AddConfigPath("./config")
	configurator.AddConfigPath("../config")
	configurator.SetEnvPrefix("USPORT")
	configurator.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	configurator.AutomaticEnv()
	setDefaults(configurator)

	if customConfigPath := configurator.GetString("config"); customConfigPath != "" {
		configurator.SetConfigFile(customConfigPath)
	}

	if err := configurator.ReadInConfig(); err != nil {
		panic(fmt.Errorf("failed to read config file: %w", err))
	}

	var cfg Config
	if err := configurator.Unmarshal(&cfg); err != nil {
		panic(fmt.Errorf("failed to unmarshal config: %w", err))
	}
	validate(cfg)

	return &cfg
}

func setDefaults(configurator *viper.Viper) {
	configurator.SetDefault("server.host", "0.0.0.0")
	configurator.SetDefault("server.port", 8080)
	configurator.SetDefault("db.host", "127.0.0.1")
	configurator.SetDefault("db.port", 3306)
	configurator.SetDefault("db.max_open_conns", 100)
	configurator.SetDefault("db.max_idle_conns", 10)
	configurator.SetDefault("db.conn_max_life", 3600)
	configurator.SetDefault("redis.host", "127.0.0.1")
	configurator.SetDefault("redis.port", 6379)
	configurator.SetDefault("redis.db", 0)
	configurator.SetDefault("redis.pool_size", 10)
	configurator.SetDefault("jwt.expire", 86400)
	configurator.SetDefault("admin.token", "usport-admin-dev")
	configurator.SetDefault("log.level", "info")
	configurator.SetDefault("log.encoding", "json")
}

func validate(cfg Config) {
	switch {
	case cfg.DB.Name == "":
		panic("db.name is required")
	case cfg.DB.User == "":
		panic("db.user is required")
	case cfg.JWT.Secret == "":
		panic("jwt.secret is required")
	case cfg.Admin.Token == "":
		panic("admin.token is required")
	case cfg.Server.Port <= 0:
		panic("server.port must be positive")
	}
}
