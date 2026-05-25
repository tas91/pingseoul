# Supabase 연결 가이드

이 저장소는 Supabase 프로젝트와 연결한 뒤 마이그레이션과 시드를 적용하는 흐름으로 사용한다.

## 1. 사전 준비

- Supabase 프로젝트가 생성되어 있어야 한다.
- `SUPABASE_PROJECT_REF` 값을 확보해야 한다.
- `supabase` CLI가 로컬에 설치되어 있어야 한다.

## 2. 로그인 및 연결

```bash
supabase login
SUPABASE_PROJECT_REF=your-project-ref npm run supabase:link
```

## 3. 스키마 반영

```bash
npm run supabase:push
```

## 4. 시드 반영

- 로컬 또는 스테이징 DB에 `supabase/seed.sql`을 적용한다.
- `STAGING_DB_URL`이 필요하면 `.env`에 설정한다.

```bash
npm run supabase:seed
```

## 5. 확인 항목

- `public.tables`에 17개 좌석이 들어간다.
- `public.events`에 데모 이벤트가 들어간다.
- enum, 인덱스, 기본 컬럼이 마이그레이션과 일치한다.
