# 1단계: 빌드용 이미지
FROM node:20-alpine AS build

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 프로젝트 복사 (단, env-config.js는 제외)
COPY . .
RUN rm -f public/env-config.js  # 🔥 빌드에 박히지 않도록 제거

# React 빌드
RUN npm run build

# 2단계: 실행용 이미지
FROM nginx:stable-alpine

# HTML 제거
RUN rm -rf /usr/share/nginx/html/*

# ✅ 빌드 결과 복사
COPY --from=build /app/build /usr/share/nginx/html

# ✅ 런타임 환경 변수 파일 복사
COPY public/env-config.js /usr/share/nginx/html/env-config.js

# ✅ nginx 설정 복사
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 실행
CMD ["nginx", "-g", "daemon off;"]
