# 음악 플레이어

유튜브 뮤직 웹사이트를 참고해 구조와 주요 기능을 구현한 개인 풀스택 프로젝트입니다.

### 프로젝트 소개

프로젝트에 사용된 스킬입니다.
<br/>

![node](https://img.shields.io/badge/Node.js-5FA04E.svg?style=for-the-badge&logo=nodedotjs&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-3178C6.svg?style=for-the-badge&logo=TypeScript&logoColor=white)
![express](https://img.shields.io/badge/Express-000000.svg?style=for-the-badge&logo=Express&logoColor=white)
![mongodb](https://img.shields.io/badge/MongoDB-47A248.svg?style=for-the-badge&logo=MongoDB&logoColor=white)
<br/>

자바스크립트를 사용하는 Node.js를 백엔드에 사용하여 러닝 커브를 줄이고자 하였습니다. DB는 MongoDB를 사용하였고 Mongoose 라이브러리를 사용하여 Node와 연결하였습니다.
프론트엔드 개발자로서 백엔드의 개발 과정을 체험해보고 소통 방식을 고려할 수 있는 프로젝트였습니다.
<br/>

### 프로젝트 일정

24.11.25 - 25.03.10 : 1차 배포 완료

### 문제 및 해결

#### 1. 풀스택 개발 중 마주한 문제와 대응

개인 프로젝트라도 프론트엔드, 백엔드를 모두 개발하면서 혼선이 있었습니다. DB 엔티티에 요소가 추가된다거나 API의 응답의 형태를 수정할 때 명확히 문서화를 하지 않아 반영 작업에 시간이 걸린 경우가 있었습니다. 이를 해결하기 위해 타입스크립트를 통해 엔티티와 API 응답 인터페이스를 명세화 하여 수정 및 확인을 용이하게 했습니다. 타입스크립트가 타입으로 인한 런타임 오류를 방지할 뿐 아니라 개발자끼리의 소통을 원활하게 하는 역할을 한다는 것을 경험했습니다.

배포 후에는 클라이언트와 서버가 다른 도메인에서 동작하면서 인증 쿠키가 전달되지 않는 문제가 발생했습니다. 로그인은 성공했지만 이후 요청에서 인증이 유지되지 않아, CORS 설정과 쿠키 속성이 원인임을 파악하는 데 시간이 걸렸습니다. 서버에 credentials: true, 쿠키에 sameSite: "none"과 secure: true를 설정해 문제를 해결할 수 있었고, 이 과정을 통해 로컬과 배포 환경의 차이를 고려한 설계가 필요하다는 점을 배웠습니다.

#### 2. JWT 로그인

로그인 기능을 구현하면서 세션 기반 인증과 JWT 기반 인증 중 어떤 방식을 사용할지 고민했습니다. 프로젝트의 구조와 향후 확장 가능성을 고려해 `JWT 기반 인증`을 선택했습니다.

토큰을 저장하는 방식도 고민이 많았지만, 보안성과 자동 전송의 편리함을 고려해 HTTP Only 쿠키에 accessToken과 refreshToken을 저장하는 방식을 선택했습니다. 이로써 클라이언트에서 직접 접근할 수 없도록 하여, 보안을 한층 강화할 수 있었습니다.

로그인 방식은 단순한 구현이 아니라, 프로젝트의 특성과 보안 수준에 맞춰 신중히 결정해야 하는 요소라는 걸 배웠습니다.

<br/>

### 관련 링크

프로젝트 배포 링크 : [https://patrick-stream-front.vercel.app/](https://patrick-stream-front.vercel.app/)
