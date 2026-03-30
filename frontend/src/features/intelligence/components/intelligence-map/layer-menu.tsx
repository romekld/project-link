import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { GeoLayerId } from '@/features/intelligence/types'
import { getLayerIcon, layerLabels } from './constants'
import { RotateCcw, Settings } from 'lucide-react'

interface LayerMenuProps {
  availableLayers: GeoLayerId[]
  effectiveVisibleLayers: GeoLayerId[]
  onToggleLayer: (layerId: GeoLayerId) => void
  onReset: () => void
}

export function LayerMenu({
  availableLayers,
  effectiveVisibleLayers,
  onToggleLayer,
  onReset,
}: LayerMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-4 z-20 size-11 rounded-full border-primary/20 bg-background/95 shadow-md supports-backdrop-filter:backdrop-blur"
            aria-label="Layer settings"
          />
        }
      >
        <Settings className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[min(100vw-2rem,18rem)] border border-primary/10 bg-background/95 shadow-lg supports-backdrop-filter:backdrop-blur"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            Layers ({effectiveVisibleLayers.length}/{availableLayers.length})
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableLayers.map((layerId) => {
            const isVisible = effectiveVisibleLayers.includes(layerId)
            const LayerIcon = getLayerIcon(layerId)

            return (
              <DropdownMenuCheckboxItem
                key={layerId}
                checked={isVisible}
                onCheckedChange={() => onToggleLayer(layerId)}
                onSelect={(event) => event.preventDefault()}
              >
                <LayerIcon className="size-4 text-muted-foreground" />
                {layerLabels[layerId].title}
              </DropdownMenuCheckboxItem>
            )
          })}
          <DropdownMenuSeparator />
        </DropdownMenuGroup>
        <DropdownMenuItem onSelect={onReset}>
          <RotateCcw className="size-4 text-muted-foreground" />
          Reset defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
