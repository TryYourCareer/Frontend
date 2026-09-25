import { render } from "@testing-library/react";
import App from "./App";

jest.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: "/" }),
}));

jest.mock("./contexts/AuthContext", () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({ user: null, session: null, loading: false }),
}));

jest.mock("./hooks/useAuth", () => ({
  useAuth: () => ({ user: null, session: null, loading: false }),
}));

jest.mock("@vercel/speed-insights/react", () => ({
  SpeedInsights: () => null,
}), { virtual: true });

jest.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}), { virtual: true });

test("renders App without crashing", () => {
  const { container } = render(<App />);
  expect(container).toBeDefined();
});
