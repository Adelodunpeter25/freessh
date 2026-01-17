import { MainLayout } from "./components/layout/MainLayout";
import { Toaster } from "./components/ui/sonner";
import { useBackend } from "./hooks";

function App(): React.JSX.Element {
  useBackend();

  return (
    <>
      <MainLayout />
      <Toaster />
    </>
  );
}

export default App;
