import { Composition } from "remotion";
import { KfarOverview } from "./KfarOverview";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="KfarOverview"
      component={KfarOverview}
      durationInFrames={9300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
