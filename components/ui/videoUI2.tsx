"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { SVG } from "../dots-svg";
import { cn } from "@/lib/utils";


let useClickOutside = (handler: () => void): MutableRefObject<HTMLDivElement | null> => {
  let domNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let maybeHandler = (event: MouseEvent) => {

      if (domNode.current && !domNode.current.contains(event.target as Node)) {
        handler();
      }
    };
    document.addEventListener("mousedown", maybeHandler);

    return () => {
      document.removeEventListener("mousedown", maybeHandler);
    };
  });
  return domNode;
};

interface Props {
  videoLink: string;
  imageLink: string;
  backgroundButtonClassName?: string; // className
  foregroundButtonClassName?: string; // className
  pingButtonClassName?: string; // className
}


export default function VideoUI2({ videoLink, imageLink, backgroundButtonClassName, foregroundButtonClassName, pingButtonClassName }: Props) {
  const [videoOpen, setvideoOpen] = useState(false);

  let domNode = useClickOutside(() => {
    setvideoOpen(false);
  });

  return (
    <div >
      <div ref={domNode} className="max-auto flex flex-wrap justify-center">
        <div className="w-full px-4 lg:w-10/12">
          <div className="relative z-20 h-[300px] overflow-hidden rounded-lg md:h-[450px]">
            <div className="absolute left-0 top-0 h-full w-full">
              <img
                src={imageLink}
                alt="bg"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div
              className={`absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center bg-black/50`}
            >
              <button
                onClick={() => setvideoOpen(true)}
                className={cn("absolute z-20 flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary dark:bg-dark-2 dark:text-white md:h-[100px] md:w-[100px]", backgroundButtonClassName)}
              >
                <span className={cn("absolute right-0 top-0 z-[-1] h-full w-full animate-ping rounded-full bg-white bg-opacity-20 delay-300 duration-1000", pingButtonClassName)}></span>
                <svg
                  width="23"
                  height="27"
                  viewBox="0 0 23 27"
                  className={cn("fill-current", foregroundButtonClassName)}
                >
                  <path d="M22.5 12.634C23.1667 13.0189 23.1667 13.9811 22.5 14.366L2.25 26.0574C1.58333 26.4423 0.750001 25.9611 0.750001 25.1913L0.750002 1.80866C0.750002 1.03886 1.58334 0.557731 2.25 0.942631L22.5 12.634Z" />
                </svg>
              </button>
            </div>
            <div>
              <span className="absolute left-4 top-4 z-40">
                <SVG />
              </span>
              <span className="absolute bottom-4 right-4 z-40">
                <SVG />
              </span>
            </div>
          </div>
        </div>
      </div>

      {videoOpen && (
        <div className="fixed px-6 left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-black/70 ">
          <div className="mx-auto w-full max-w-5xl">
            <div
              className="w-full max-h-full rounded-3xl shadow-2xl aspect-video bg-black overflow-hidden"
              ref={domNode}
            >
              <video width="1920" height="1080" loop autoPlay controls controlsList="nodownload">
                <source
                  src={videoLink}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <button
            onClick={() => setvideoOpen(false)}
            className="absolute right-0 top-0 flex h-20 w-20 cursor-pointer items-center justify-center text-body-color hover:bg-black"
          >
            <svg viewBox="0 0 16 15" className="h-8 w-8 fill-current">
              <path d="M3.37258 1.27L8.23258 6.13L13.0726 1.29C13.1574 1.19972 13.2596 1.12749 13.373 1.07766C13.4864 1.02783 13.6087 1.00141 13.7326 1C13.9978 1 14.2522 1.10536 14.4397 1.29289C14.6272 1.48043 14.7326 1.73478 14.7326 2C14.7349 2.1226 14.7122 2.24439 14.6657 2.35788C14.6193 2.47138 14.5502 2.57419 14.4626 2.66L9.57258 7.5L14.4626 12.39C14.6274 12.5512 14.724 12.7696 14.7326 13C14.7326 13.2652 14.6272 13.5196 14.4397 13.7071C14.2522 13.8946 13.9978 14 13.7326 14C13.6051 14.0053 13.478 13.984 13.3592 13.9375C13.2404 13.8911 13.1326 13.8204 13.0426 13.73L8.23258 8.87L3.38258 13.72C3.29809 13.8073 3.19715 13.8769 3.08559 13.925C2.97402 13.9731 2.85405 13.9986 2.73258 14C2.46737 14 2.21301 13.8946 2.02548 13.7071C1.83794 13.5196 1.73258 13.2652 1.73258 13C1.73025 12.8774 1.753 12.7556 1.79943 12.6421C1.84586 12.5286 1.91499 12.4258 2.00258 12.34L6.89258 7.5L2.00258 2.61C1.83777 2.44876 1.74112 2.23041 1.73258 2C1.73258 1.73478 1.83794 1.48043 2.02548 1.29289C2.21301 1.10536 2.46737 1 2.73258 1C2.97258 1.003 3.20258 1.1 3.37258 1.27Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
