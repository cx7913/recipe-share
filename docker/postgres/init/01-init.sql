-- ============================================
-- PostgreSQL 초기화 스크립트
-- ============================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 개발용 추가 데이터베이스 (테스트용)
CREATE DATABASE recipe_share_test;
GRANT ALL PRIVILEGES ON DATABASE recipe_share_test TO recipe_user;
