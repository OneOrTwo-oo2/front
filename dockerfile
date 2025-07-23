# 1단계: 빌드용 이미지
FROM node:20-alpine AS build

WORKDIR /app

# 환경 변수 설정 (소스맵 제거)
ENV GENERATE_SOURCEMAP=false

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: 실행용 이미지
FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
