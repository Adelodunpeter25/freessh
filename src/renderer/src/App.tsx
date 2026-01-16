import { MainLayout } from "./components/layout/MainLayout";
import { useBackend } from "./hooks";

function App(): React.JSX.Element {
  useBackend();

  return <MainLayout />;
}

export default App;
