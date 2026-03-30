import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle2, Send, ShieldAlert } from 'lucide-react'

interface CoverageTableToolbarProps {
  canClearSelectionDraft: boolean
  canStageAdd: boolean
  canStageRemove: boolean
  stageAddHint?: string
  stageRemoveHint?: string
  hasStagedChanges: boolean
  onStageAdd: () => void
  onStageRemove: () => void
  onClearDraft: () => void
  onReviewApply: () => void
}

function ToolbarAction({
  disabled,
  hint,
  onClick,
  variant = 'outline',
  children,
}: {
  disabled: boolean
  hint?: string
  onClick: () => void
  variant?: 'outline' | 'ghost'
  children: ReactNode
}) {
  const button = (
    <Button variant={variant} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )

  if (!disabled || !hint) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex">{button}</span>} />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

export function CoverageTableToolbar({
  canClearSelectionDraft,
  canStageAdd,
  canStageRemove,
  stageAddHint,
  stageRemoveHint,
  hasStagedChanges,
  onStageAdd,
  onStageRemove,
  onClearDraft,
  onReviewApply,
}: CoverageTableToolbarProps) {
  return (
    <>
      <ToolbarAction
        disabled={!canStageAdd}
        hint={stageAddHint}
        onClick={onStageAdd}
      >
        <CheckCircle2 data-icon="inline-start" />
        Stage add
      </ToolbarAction>
      <ToolbarAction
        disabled={!canStageRemove}
        hint={stageRemoveHint}
        onClick={onStageRemove}
      >
        <ShieldAlert data-icon="inline-start" />
        Stage remove
      </ToolbarAction>
      <Button
        variant="ghost"
        disabled={!canClearSelectionDraft}
        onClick={onClearDraft}
      >
        Clear draft
      </Button>
      <Button
        disabled={!hasStagedChanges}
        onClick={onReviewApply}
      >
        <Send data-icon="inline-start" />
        Review and apply
      </Button>
    </>
  )
}
