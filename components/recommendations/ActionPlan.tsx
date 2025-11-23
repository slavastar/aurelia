'use client';

import { CheckCircle2, Target, Lightbulb, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionSteps: string[];
  resources?: Array<{
    title: string;
    url: string;
  }>;
}

interface ActionPlanProps {
  recommendations: Recommendation[];
}

export default function ActionPlan({ recommendations }: ActionPlanProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-200 border-red-500/30';
      case 'medium':
        return 'bg-amber-500/20 text-amber-200 border-amber-500/30';
      case 'low':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/10';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return 'Priority';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-8 text-center">
        <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No specific recommendations at this time.</p>
        <p className="text-sm text-white/40 mt-2">Keep up the great work!</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {recommendations.map((rec, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-6 hover:bg-white/15 transition-all"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-aurelia-lime uppercase tracking-wide">
                  {rec.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(rec.priority)}`}>
                  {getPriorityLabel(rec.priority)}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{rec.title}</h3>
            </div>
            <Target className="w-6 h-6 text-aurelia-lime flex-shrink-0" />
          </div>

          {/* Description */}
          <p className="text-white/80 mb-4">{rec.description}</p>

          {/* Action Steps */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-aurelia-lime" />
              <h4 className="font-semibold text-white">Action Steps:</h4>
            </div>
            <ul className="space-y-2">
              {rec.actionSteps.map((step, stepIndex) => (
                <li key={stepIndex} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-aurelia-lime/20 text-aurelia-lime rounded-full flex items-center justify-center text-sm font-semibold">
                    {stepIndex + 1}
                  </span>
                  <span className="text-white/80 pt-0.5">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          {rec.resources && rec.resources.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-white">Helpful Resources:</h4>
              </div>
              <div className="space-y-2">
                {rec.resources.map((resource, resIndex) => (
                  <a
                    key={resIndex}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-aurelia-lime hover:text-aurelia-lime/80 transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span className="text-sm underline">{resource.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
