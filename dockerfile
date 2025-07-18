# 1단계: 빌드용 이미지
FROM node:20-alpine AS build

# 작업 디렉토리 지정 (가상 경로)
WORKDIR /app

# package.json과 lock 파일 복사 → 의존성 설치
COPY package*.json ./
RUN npm install

# 전체 프로젝트 복사
COPY .env .
COPY . .
RUN rm -f public/env-config.js

# React 앱 빌드
RUN npm run build

# 2단계: 실행용 이미지 (Nginx)
FROM nginx:stable-alpine

# 기존 HTML 제거
RUN rm -rf /usr/share/nginx/html/*

# 빌드 결과 복사
COPY --from=build /app/build /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
