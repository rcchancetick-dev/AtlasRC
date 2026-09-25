import { motion, useReducedMotion } from 'framer-motion';

export function HeroBackground() {
  const reduceMotion = useReducedMotion();
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
    <motion.div
      className="absolute -top-12 left-[6%] h-36 w-36 rounded-full bg-indigo-400/15 blur-2xl sm:h-52 sm:w-52"
      animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, -12, 0], opacity: [.55, .8, .55] }}
      transition={reduceMotion ? undefined : { duration: 18, ease: 'easeInOut', repeat: Infinity }}
    />
    <motion.div
      className="absolute bottom-[-3rem] right-[8%] h-40 w-40 rounded-full bg-violet-400/15 blur-2xl sm:h-60 sm:w-60"
      animate={reduceMotion ? undefined : { x: [0, -15, 0], y: [0, 10, 0], opacity: [.5, .75, .5] }}
      transition={reduceMotion ? undefined : { duration: 22, ease: 'easeInOut', repeat: Infinity }}
    />
  </div>;
}
