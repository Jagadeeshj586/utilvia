export type QualityPreset = "standard" | "high" | "maximum";

export type SegmentationProvider = "imgly" | "clipdrop" | "removebg" | "auto";

export type ImglyModel = "isnet" | "isnet_fp16" | "isnet_quint8";

export type ProcessingStage =
  | "validate"
  | "analyze"
  | "segment"
  | "refine"
  | "decontaminate"
  | "compose"
  | "retry"
  | "done";

export type StageStatus = "pending" | "active" | "complete" | "error";

export type BackgroundFill = "transparent" | "white" | "black" | "custom";

export type BrushMode = "restore" | "erase";

export type BrushSizePreset = "small" | "medium" | "large";

export type RgbColor = { r: number; g: number; b: number };

export type ValidationResult = {
  ok: boolean;
  score: number;
  reasons: string[];
  foregroundRatio: number;
  backgroundRatio: number;
  uncertainRatio: number;
};

export type DecodedImage = {
  imageData: ImageData;
  width: number;
  height: number;
};

export type BackgroundRemovalOptions = {
  quality: QualityPreset;
  keepShadow: boolean;
  provider?: SegmentationProvider;
  model?: ImglyModel;
  signal?: AbortSignal;
  onStage?: (stage: ProcessingStage, detail?: string) => void;
  onDownloadProgress?: (loaded: number, total: number) => void;
};

export type BackgroundRemovalResult = {
  png: Blob;
  width: number;
  height: number;
  original: ImageData;
  alpha: Uint8ClampedArray;
  validation: ValidationResult;
  usedFallback: boolean;
  provider: string;
  model: string;
};

export type UserFriendlyErrorCode =
  | "unsupported"
  | "corrupt"
  | "too_large"
  | "network"
  | "timeout"
  | "unavailable"
  | "empty"
  | "rate_limit"
  | "failed";
