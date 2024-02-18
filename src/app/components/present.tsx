"use client";

import { useCopilotContext } from "@copilotkit/react-core";
import { CopilotTask } from "@copilotkit/react-core";
import {
  useMakeCopilotActionable,
  useMakeCopilotReadable,
} from "@copilotkit/react-core";
import { useEffect, useState } from "react";
import "./../presentation/styles.css";
import Markdown from "react-markdown";

let globalAudio: any = undefined;

// Define slide interface
interface Slide {
  title: string;
  content: string;
  backgroundImage: string;
}

export function Presentation() {
  const [allSlides, setAllSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  useEffect(() => {
    if (!globalAudio) {
      globalAudio = new Audio();
    }
  }, []);

  useMakeCopilotReadable(
    "Powerpoint presentation slides: " + JSON.stringify(allSlides)
  );

  useMakeCopilotActionable(
    {
      name: "createNewPowerPointSlide",
      description:
        "create a slide for a powerpoint presentation. Call this function multiple times to present multiple slides.",
      argumentAnnotations: [
        {
          name: "slideTitle",
          type: "string",
          description:
            "The topic to display in the presentation slide. Use simple markdown to outline your speech, like a headline.",
          required: true,
        },
        {
          name: "content",
          type: "string",
          description:
            "The content to display in the presentation slide. Use simple markdown to outline your speech, like lists, paragraphs, etc.",
          required: true,
        },
        {
          name: "backgroundImage",
          type: "string",
          description:
            "What to display in the background of the slide (i.e. 'dog' or 'house').",
          required: true,
        },
        {
          name: "speech",
          type: "string",
          description: "An informative speech about the current slide.",
          required: true,
        },
      ],

      implementation: async (
        newSlideTitle,
        newSlideContent,
        newSlideBackgroundImage,
        speech
      ) => {
        const newSlide: Slide = {
          title: newSlideTitle,
          content: newSlideContent,
          backgroundImage: newSlideBackgroundImage,
        };
        const updatedSlides = [...allSlides, newSlide];
        setAllSlides(updatedSlides);
        setCurrentSlideIndex(updatedSlides.length - 1);

        const encodedText = encodeURIComponent(speech);
        const url = `/api/tts?text=${encodedText}`;
        globalAudio.src = url;
        await globalAudio.play();
        await new Promise<void>((resolve) => {
          globalAudio.onended = function () {
            resolve();
          };
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      },
    },
    []
  );

  // Display current slide
  const displayCurrentSlide = () => {
    const slide = allSlides[currentSlideIndex];
    return slide ? (
      <div
        className="h-screen flex flex-col justify-center items-center text-5xl text-white bg-cover bg-center bg-no-repeat p-10 text-center"
        style={{
          backgroundImage:
            'url("https://source.unsplash.com/featured/?' +
            encodeURIComponent(allSlides[currentSlideIndex].backgroundImage) +
            '")',
          textShadow:
            "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
        }}>
        <Markdown className="markdown">{slide.title}</Markdown>
        <Markdown className="markdown">{slide.content}</Markdown>
      </div>
    ) : (
      <div className="h-screen flex flex-col justify-center items-center text-5xl text-white bg-cover bg-center bg-no-repeat p-10 text-center">
        No Slide To Display
      </div>
    );
  };

  // Add new slide function
  const addSlide = new CopilotTask({
    instructions: "create a new slide",
    actions: [
      {
        name: "newSlide",
        description: "Make a new slide related to the current topic.",
        argumentAnnotations: [
          {
            name: "title",
            type: "string",
            description: "The title to display in the presentation slide.",
            required: true,
          },
          {
            name: "content",
            type: "string",
            description: "The title to display in the presentation slide.",
            required: true,
          },
          {
            name: "backgroundImage",
            type: "string",
            description:
              "What to display in the background of the slide (i.e. 'dog' or 'house').",
            required: true,
          },
          {
            name: "speech",
            type: "string",
            description: "An informative speech about the current slide.",
            required: true,
          },
        ],

        implementation: async (
          newSlideTitle,
          newSlideContent,
          newSlideBackgroundImage,
          speech
        ) => {
          const newSlide: Slide = {
            title: newSlideTitle,
            content: newSlideContent,
            backgroundImage: newSlideBackgroundImage,
          };
          const updatedSlides = [...allSlides, newSlide];
          setAllSlides(updatedSlides);
          setCurrentSlideIndex(updatedSlides.length - 1);

          const encodedText = encodeURIComponent(speech);
          const url = `/api/tts?text=${encodedText}`;
          globalAudio.src = url;
          await globalAudio.play();
          await new Promise<void>((resolve) => {
            globalAudio.onended = function () {
              resolve();
            };
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
        },
      },
    ],
  });

  const context = useCopilotContext();

  const [randomSlideTaskRunning, setRandomSlideTaskRunning] = useState(false);

  // Button click handlers for navigation
  const goBack = () => setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
  const goForward = () =>
    setCurrentSlideIndex((prev) => Math.min(allSlides.length - 1, prev + 1));

  return (
    <div>
      {displayCurrentSlide()}
      <button
        disabled={randomSlideTaskRunning}
        className={`absolute bottom-12 left-0 mb-4 ml-4 bg-blue-500 text-white font-bold py-2 px-4 rounded
            ${
              randomSlideTaskRunning
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
        onClick={async () => {
          try {
            setRandomSlideTaskRunning(true);
            await addSlide.run(context);
          } finally {
            setRandomSlideTaskRunning(false);
          }
        }}>
        {randomSlideTaskRunning ? "Loading slide..." : "Add Slide +"}
      </button>
      <button
        className={`absolute bottom-0 left-0 mb-4 ml-4 bg-blue-500 text-white font-bold py-2 px-4 rounded
          ${
            randomSlideTaskRunning
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700"
          }`}
        onClick={goBack}>
        Prev
      </button>
      <button
        className={`absolute bottom-0 left-20 mb-4 ml-4 bg-blue-500 text-white font-bold py-2 px-4 rounded
          ${
            randomSlideTaskRunning
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-blue-700"
          }`}
        onClick={goForward}>
        Next
      </button>
    </div>
  );
}
