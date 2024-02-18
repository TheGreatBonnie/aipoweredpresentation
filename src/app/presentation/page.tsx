"use client";

import {
  CopilotKit
} from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css"; 
import {Presentation} from "../components/present";
import "./styles.css";

let globalAudio: any = undefined;
let globalAudioEnabled = false;

const Demo = () => {
  return (
    <CopilotKit url="/api/copilotkit/openai">
      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Presentation Copilot",
          initial: "Hi you! 👋 I can give you a presentation on any topic.",
        }}
        clickOutsideToClose={false}
        onSubmitMessage={async (message) => {
          if (!globalAudioEnabled) {
            globalAudio.play();
            globalAudio.pause();
          }
          globalAudioEnabled = true;
        }}
      >
        <Presentation/>
      </CopilotSidebar>
    </CopilotKit>
  );
};

export default Demo;