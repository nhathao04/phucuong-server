export enum InquiryStatus {
  DRAFT = "draft",
  NEW = "new",
  CONTACTED = "contacted",
  QUOTATION_SENT = "quotation_sent",
  NEGOTIATING = "negotiating",
  CONFIRMED_ORDER = "confirmed_order",
  CLOSED = "closed",
  CANCELLED = "cancelled",
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  PROCESSING = "processing",
}

export enum InquiryFormStatus {
  DRAFT_STEP_1 = "draft_step_1",
  DRAFT_STEP_2 = "draft_step_2",
  DRAFT_STEP_3 = "draft_step_3",
  READY_TO_SUBMIT = "ready_to_submit",
  SUBMITTED = "submitted",
}

export enum InquirySalesStatus {
  NEW = "new",
  CONTACTED = "contacted",
  QUOTATION_SENT = "quotation_sent",
  NEGOTIATING = "negotiating",
  CONFIRMED_ORDER = "confirmed_order",
  CLOSED = "closed",
}

export enum InquiryEmailType {
  STEP_1 = "step_1",
  STEP_2 = "step_2",
  STEP_3 = "step_3",
  SUBMIT = "submit",
  CUSTOMER_CONFIRM = "customer_confirm",
}

export enum InquiryActivityAction {
  STEP_COMPLETED = "step_completed",
  CUSTOMER_CHANGED = "customer_changed",
  PRODUCT_CHANGED = "product_changed",
  COMMERCIAL_CHANGED = "commercial_changed",
  REQUIREMENT_CHANGED = "requirement_changed",
  SUBMITTED = "submitted",
  AUTO_SAVED = "auto_saved",
}

export enum InquiryAction {
  CONTINUE = "continue",
  SUBMIT = "submit",
}

export enum InquiryTradeTerm {
  EXW = "EXW",
  FOB = "FOB",
  CNF = "CNF",
  CFR = "CFR",
  CIF = "CIF",
  DDP = "DDP",
}

export enum InquiryPaymentTerm {
  TT_100_ADVANCE = "tt_100_advance",
  TT_30_DEPOSIT_70_BEFORE_SHIPMENT = "tt_30_deposit_70_before_shipment",
  TT_50_DEPOSIT_50_BEFORE_SHIPMENT = "tt_50_deposit_50_before_shipment",
  OTHER = "other",
}

export enum InquiryQuantityUnit {
  MT = "MT",
  KG = "KG",
  TON = "TON",
  CONTAINER = "CONTAINER",
}

export enum AssignmentRole {
  ADMIN = "admin",
  STAFF = "staff",
}

export enum EmailOutboxStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}
