# 1단계: React 앱 빌드
FROM node:18-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm install

# 앱 소스 복사 및 빌드
COPY . .
RUN npm run build

# 2단계: 빌드된 파일을 Nginx로 서빙
FROM nginx:stable-alpine

# 빌드 결과물 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 기본 설정 덮어쓰기 원하면 아래 사용 가능 // 
# 기본 설정으로 하면 React Router 기능 사용x , API 요청을 프록시 처리하고 싶을 때 필요!
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 열기
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
