"use client";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import NormalizeWheel from "normalize-wheel";
import Introduction from "../sections/introduction";
import Projects from "../sections/project";

interface ContentItem {
  background: string;
  foreground: string;
  component: JSX.Element;
}

class Container {
  container: HTMLElement | null;
  boxes: NodeListOf<HTMLElement> | HTMLElement[];
  scroll: { current: number; target: number; limit: number };
  gratio: number;
  spConstant: number;
  squareSize: number;
  scaleRatio: number;
  vw: number;
  beizer: string;
  ease: number;
  snapTarget?: number;
  frame?: number;
  timeout?: NodeJS.Timeout;
  content: ContentItem[];

  constructor(content: ContentItem[], containerRef: React.RefObject<HTMLElement>) {
    this.container = containerRef.current;
    this.boxes = [];
    this.vw = window.innerWidth;
    this.gratio = 1.618;
    this.spConstant = 0.2763;
    this.squareSize = this.vw / this.gratio;
    this.scaleRatio = (this.vw - this.squareSize) / this.squareSize;
    this.beizer = "cubic-bezier(0.25, 0.1, 0.0, 1.0)";
    this.ease = 0.05;
    this.content = content;

    this.scroll = {
      current: 0,
      target: 0,
      limit: this.squareSize * content.length,
    };

    this.init(content);
    this.updateScroll();
    this.addEventListeners();
  }

  init(content: ContentItem[]) {
    const skrinkagePointX = window.innerWidth * this.spConstant;
    const skrinkagePointY = this.squareSize * this.spConstant;
    const originX = skrinkagePointX * Math.pow(this.gratio, 2);
    const originY = skrinkagePointY * Math.pow(this.gratio, 2);

    if (this.container) {
      this.container.style.transformOrigin = `${originX}px ${originY}px`;

      content.forEach((item, index) => {
        const div = this.boxes[index] || document.createElement("div");
        div.setAttribute("class", "nj-item");
        const scale = Math.pow(this.scaleRatio, index);

        div.style.cssText = `
          position: absolute;
          border: 2px solid black;
          background-color: white;
          width: ${this.squareSize / 10}rem;
          height: ${this.squareSize / 10}rem;
          transform-origin: ${originX / 10}rem ${originY / 10}rem;
          transform: rotate(${90 * index}deg) scale(${scale});
        `;

        if (!this.boxes.length && this.container) {
          this.container.appendChild(div);
        }
        div.dataset.background = item.background;
        div.dataset.foreground = item.foreground;

        ReactDOM.render(item.component, div);
      });

      this.boxes = this.boxes.length
        ? this.boxes
        : this.container.querySelectorAll(".nj-item");
    }
  }

  updateScroll() {
    const { current, target, limit } = this.scroll;
    this.scroll.target = this.clamp(0, limit, target);
    this.scroll.current = this.lerp(current, this.scroll.target, this.ease);
    this.frame = window.requestAnimationFrame(this.updateScroll.bind(this));
    this.spinContainer();
  }

  spinContainer() {
    const { current, limit } = this.scroll;
    const lastBoxIndex = this.boxes.length - 1;
    const maxAngle = 90 * lastBoxIndex;
    const degreeUnit = maxAngle / limit;
    const currentDegree = degreeUnit * current;
    const maxIndex = lastBoxIndex;
    const scaleUnit = maxIndex / limit;
    const currentScale = Math.pow(this.gratio, scaleUnit * current);

    if (this.container) {
      this.container.style.transform = `rotate(${-currentDegree}deg) scale(${currentScale})`;
    }

    const scrolledPercentage = Math.round((current / limit) * 100);
    const deg = (scrolledPercentage * maxAngle) / 100;
    const closest90Deg = Math.round(deg / 90) * 90;
    this.snapTarget = closest90Deg / degreeUnit;

    if (closest90Deg % 90 === 0) {
      const rotations = closest90Deg / 90;
      const colors = this.boxes[rotations] as HTMLElement;

      if (colors) {
        document.body.style.backgroundColor = colors.dataset.background || "";

        this.boxes.forEach((item, index) => {
          if (item instanceof HTMLElement) {
            item.style.backgroundColor = colors.dataset.foreground || "";
            item.style.color = colors.dataset.background || "";
            item.style.borderColor = colors.dataset.background || "";
            item.style.display = rotations >= index + 2 ? "none" : "grid";
          }
        });
      }
    }
  }

  snapScroll() {
    if (this.snapTarget === undefined || this.snapTarget < 0) return;

    const transitionTime = 500;
    this.scroll.target = this.snapTarget;
    this.scroll.current = this.snapTarget;
    if (this.container) {
      this.container.style.transition = `transform ${transitionTime}ms ${this.beizer}`;
    }

    setTimeout(() => {
      if (this.container) {
        this.container.style.transition = "unset";
      }
    }, transitionTime);
  }

  onResize() {
    this.vw = window.innerWidth;
    this.squareSize = this.vw / this.gratio;
    this.scaleRatio = (this.vw - this.squareSize) / this.squareSize;
    this.scroll.limit = this.squareSize * this.boxes.length;

    this.init([]);
  }

  onMouseWheel(e: WheelEvent) {
    const { pixelY } = NormalizeWheel(e);
    this.scroll.target += pixelY * 0.3;

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.snapScroll();
    }, 300);
  }

  lerp(current: number, target: number, ease: number) {
    return current + (target - current) * ease;
  }

  clamp(min: number, max: number, value: number) {
    return Math.min(Math.max(value, min), max);
  }

  addEventListeners() {
    document.addEventListener("wheel", this.onMouseWheel.bind(this));
    window.addEventListener("resize", this.onResize.bind(this));
  }
}

const GoldenRatio = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const contentItems: ContentItem[] = [
    { background: "rgba(202, 144, 222, 0.7)", foreground: "rgba(69, 49, 109, 0.7)", component: <Introduction /> },
    { background: "rgba(202, 144, 222, 0.7)", foreground: "rgba(69, 49, 109, 0.7)", component: <Projects /> },
    { background: "rgba(184, 44, 51, 0.7)", foreground: "rgba(47, 51, 55, 0.7)", component: <Projects /> },
    {
      background: "rgba(202, 144, 222, 0.7)", foreground: "rgba(69, 49, 109, 0.7)", component: <Projects />
    },
    {
      background: "rgba(202, 144, 222, 0.7)", foreground: "rgba(69, 49, 109, 0.7)", component: <Projects />
    },
    {
      background: "rgba(184, 44, 51, 0.7)", foreground: "rgba(47, 51, 55, 0.7)", component: <Projects />
    },
    {
      background: "rgba(0, 0, 0, 0.7)", foreground: "rgba(45, 186, 81, 0.7)", component: <Projects />
    },
    {
      background: "rgba(107, 212, 255, 0.7)", foreground: "rgba(64, 110, 137, 0.7)", component: <Projects />
    },
    {
      background: "rgba(83, 189, 173, 0.7)", foreground: "rgba(53, 41, 63, 0.7)", component: <Projects />
    },
    {
      background: "rgba(233, 94, 74, 0.7)", foreground: "rgba(48, 26, 49, 0.7)", component: <Projects />
    },
    {
      background: "rgba(217, 204, 186, 0.7)", foreground: "rgba(35, 36, 46, 0.7)", component: <Projects />
    },
    {
      background: "rgba(202, 144, 222, 0.7)", foreground: "rgba(69, 49, 109, 0.7)", component: <Projects />
    }

  ];

  useEffect(() => {
    if (containerRef.current) {
      new Container(contentItems, containerRef);
    }
  }, []);

  return (
    <section className="nj-container" ref={containerRef}></section>
  );
};

export default GoldenRatio;
