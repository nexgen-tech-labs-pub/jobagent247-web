interface AgentWorkflowNodeProps {
  number: number
  title: string
  description: string
  isLast?: boolean
}

export function AgentWorkflowNode({ number, title, description, isLast = false }: AgentWorkflowNodeProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="glass-card p-6 w-full max-w-[220px] relative">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)', color: 'white' }}>
          {number}
        </div>
        <h3 className="font-heading font-semibold text-base text-white mb-2">{title}</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{description}</p>
      </div>
      {!isLast && (
        <div className="hidden lg:flex items-center justify-center w-8 my-0 absolute">
          {/* Connector rendered by parent flex layout */}
        </div>
      )}
    </div>
  )
}
