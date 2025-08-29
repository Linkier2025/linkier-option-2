'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AnimatedTabs = TabsPrimitive.Root;

const AnimatedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-foreground relative',
      className
    )}
    {...props}
  />
));
AnimatedTabsList.displayName = TabsPrimitive.List.displayName;

interface AnimatedTabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  activeTabIndex: number;
  totalTabs: number;
  'data-state'?: 'active' | 'inactive';
}

const AnimatedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  AnimatedTabsTriggerProps
>(({ className, activeTabIndex, totalTabs, ...props }, ref) => {
  const tabWidth = 100 / totalTabs;
  const left = `${activeTabIndex * tabWidth}%`;
  const width = `${tabWidth}%`;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-foreground relative z-10 h-8',
        className
      )}
      {...props}
    >
      {props.children}
      {props['data-state'] === 'active' && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute bottom-0 left-0 h-[2px] bg-primary z-0"
          style={{
            width,
            left,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        />
      )}
    </TabsPrimitive.Trigger>
  );
});
AnimatedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const AnimatedTabsContent = TabsPrimitive.Content;

export { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent };
