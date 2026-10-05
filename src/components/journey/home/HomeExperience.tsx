"use client";
import { useState } from "react";
import { journeyIntro } from "@/data/journey/config";
import { useJourney, useJourneyReady } from "@/lib/journey/store";
import { VideoIntro } from "../VideoIntro";
import { JourneyHome } from "./JourneyHome";

/**
 * Home decides between the opening film and the student's own journey. A
 * first visit (or a student who asks to update where they are) gets the film
 * and its four states; anyone with a journey gets their continuation
 * dashboard. One home, rendered from journey state — never four homepages.
 */
export function HomeExperience() {
  const ready = useJourneyReady();
  const { profile } = useJourney();
  const [updating, setUpdating] = useState(false);

  // saved progress is read on the client; hold a plain stage until it's known
  if (!ready) {
    return (
      <section aria-labelledby="intro-title" className="h-[100svh] bg-matte">
        <h1 id="intro-title" className="sr-only">{journeyIntro.title}</h1>
      </section>
    );
  }

  if (!profile.journeyStage) return <VideoIntro />;
  if (updating) return <VideoIntro onBack={() => setUpdating(false)} />;
  return <JourneyHome onUpdate={() => setUpdating(true)} />;
}
