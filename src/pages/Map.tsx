import { useTitle } from "../hooks/useTitle";
import { WorldMap } from "../components/WorldMap";

export function MapPage() {
  useTitle("Travel");
  return <WorldMap />;
}
