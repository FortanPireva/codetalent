"use client";

import { useRef } from "react";
import {
  motion,
  useInView,
} from "framer-motion";
import {
  FileText,
  Users,
  BarChart,
  Send,
  UserPlus,
  Code,
  Bot,
  Eye,
} from "lucide-react";

const companySteps = [
  { icon: FileText, label: "Post a job" },
  { icon: Users, label: "Browse the talent pool" },
  { icon: BarChart, label: "Review AI assessments" },
  { icon: Send, label: "Invite to interview" },
];

const developerSteps = [
  { icon: UserPlus, label: "Create your profile" },
  { icon: Code, label: "Complete an assessment" },
  { icon: Bot, label: "Get AI-reviewed" },
  { icon: Eye, label: "Get discovered" },
];

function AnimatedStep({
  step,
  index,
  total,
  columnDelay,
}: {
  step: { icon: React.ComponentType<{ className?: string }>; label: string };
  index: number;
  total: number;
  columnDelay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const baseDelay = columnDelay + index * 0.15;

  return (
    <div ref={ref} className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: baseDelay,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/20 bg-background"
        >
          <step.icon className="h-4 w-4 text-primary" />
        </motion.div>
        {index < total - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
              delay: baseDelay + 0.1,
            }}
            className="h-8 w-px origin-top bg-border"
          />
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
          delay: baseDelay + 0.05,
        }}
        className="flex h-10 items-center"
      >
        <p className="font-medium">
          <span className="mr-2 text-muted-foreground">{index + 1}.</span>
          {step.label}
        </p>
      </motion.div>
    </div>
  );
}

function AnimatedStepList({
  steps,
  columnDelay,
}: {
  steps: { icon: React.ComponentType<{ className?: string }>; label: string }[];
  columnDelay: number;
}) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <AnimatedStep
          key={step.label}
          step={step}
          index={index}
          total={steps.length}
          columnDelay={columnDelay}
        />
      ))}
    </div>
  );
}

export function HowItWorks() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div ref={headerRef} className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="mt-2 text-muted-foreground"
          >
            Two parallel paths, one marketplace.
          </motion.p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-16 md:grid-cols-2 md:gap-12">
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8 text-lg font-semibold"
            >
              Company Path
            </motion.h3>
            <AnimatedStepList steps={companySteps} columnDelay={0.1} />
          </div>
          <div>
            <motion.h3
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="mb-8 text-lg font-semibold"
            >
              Developer Path
            </motion.h3>
            <AnimatedStepList steps={developerSteps} columnDelay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
