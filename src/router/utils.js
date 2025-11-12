const BASE_PATH = import.meta.env.VITE_BASE_PATH || "/";

export const normalizePath = (pathname) => {
  if (!pathname.startsWith(BASE_PATH)) return pathname;

  const pattern = new RegExp(`^${BASE_PATH}(?:/)?`);
  let path = pathname.replace(pattern, "/");

  // 중복된 슬래시 제거
  path = path.replace(/\/{2,}/g, "/");
  // 항상 /로 시작하도록 보정
  if (!path.startsWith("/")) path = "/" + path;

  return path === "" ? "/" : path;
};

// 경로 패턴을 정규식으로 변환하고 파라미터 이름 추출
export const pathToRegex = (path) => {
  const paramNames = [];
  const pattern = path.replace(/\//g, "\\/").replace(/:(\w+)/g, (_, paramName) => {
    paramNames.push(paramName);
    return "([^/]+)";
  });

  return {
    regex: new RegExp(`^${pattern}$`),
    paramNames,
  };
};

// 경로와 라우트 패턴 매칭 및 파라미터 추출
export const matchRoute = (path, routePath) => {
  if (routePath === path) {
    return { match: true, params: {} };
  }

  if (routePath.includes(":")) {
    const { regex, paramNames } = pathToRegex(routePath);

    console.log(typeof path);
    const match = path.match(regex);

    if (match) {
      const params = {};
      paramNames.forEach((name, index) => {
        params[name] = match[index + 1];
      });
      return { match: true, params };
    }
  }

  return { match: false, params: {} };
};
