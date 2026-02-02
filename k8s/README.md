# Kubernetes Deployment

로컬 테스트용 Kubernetes manifest입니다.

## 사전 요구사항

- Docker Desktop with Kubernetes 또는 Minikube
- kubectl CLI
- (선택) kustomize CLI

## 구조

```
k8s/
├── base/                    # 기본 manifest
│   ├── namespace.yaml       # Namespace
│   ├── configmap.yaml       # 환경 변수
│   ├── secret.yaml          # 민감 정보
│   ├── pvc.yaml            # 영구 볼륨
│   ├── postgres.yaml       # PostgreSQL
│   ├── redis.yaml          # Redis
│   ├── api.yaml            # NestJS API
│   ├── web.yaml            # Next.js Web
│   ├── ingress.yaml        # Ingress
│   └── kustomization.yaml  # Kustomize 설정
└── overlays/
    └── local/              # 로컬 개발용 오버레이
        ├── nodeport-services.yaml
        └── kustomization.yaml
```

## 배포 방법

### 1. Docker 이미지 빌드

```bash
# 프로젝트 루트에서 실행
docker build -t recipe-share-api:latest -f docker/api/Dockerfile.prod .
docker build -t recipe-share-web:latest -f docker/web/Dockerfile.prod .
```

### 2. Minikube 사용 시 (이미지 로드)

```bash
minikube image load recipe-share-api:latest
minikube image load recipe-share-web:latest
```

### 3. 배포

```bash
# kustomize 사용
kubectl apply -k k8s/overlays/local

# 또는 직접 적용
kubectl apply -k k8s/base
kubectl apply -f k8s/overlays/local/nodeport-services.yaml
```

### 4. 상태 확인

```bash
kubectl get all -n recipe-share
kubectl get pods -n recipe-share -w
```

### 5. 접속

**NodePort 사용 시:**
- Web: http://localhost:30300
- API: http://localhost:30400
- Health: http://localhost:30400/health

**Ingress 사용 시:**
```bash
# /etc/hosts에 추가
echo "127.0.0.1 recipe-share.local" | sudo tee -a /etc/hosts

# Minikube tunnel 실행
minikube tunnel
```
- Web & API: http://recipe-share.local

### 6. 로그 확인

```bash
kubectl logs -f deployment/api -n recipe-share
kubectl logs -f deployment/web -n recipe-share
kubectl logs -f deployment/postgres -n recipe-share
```

### 7. 삭제

```bash
kubectl delete -k k8s/overlays/local
# 또는
kubectl delete namespace recipe-share
```

## 데이터베이스 마이그레이션

```bash
# API Pod에서 마이그레이션 실행
kubectl exec -it deployment/api -n recipe-share -- npx prisma migrate deploy
```

## 트러블슈팅

### Pod가 시작되지 않을 때
```bash
kubectl describe pod <pod-name> -n recipe-share
kubectl logs <pod-name> -n recipe-share
```

### PVC가 Pending 상태일 때
```bash
kubectl get pvc -n recipe-share
kubectl get storageclass
```

### Database 연결 오류
```bash
# PostgreSQL Pod 내부에서 확인
kubectl exec -it deployment/postgres -n recipe-share -- psql -U recipe_user -d recipe_share
```
