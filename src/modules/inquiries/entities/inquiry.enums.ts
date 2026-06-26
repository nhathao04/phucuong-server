export enum InquiryStatus {
  IN_PROGRESS = "in_progress",
  SUBMITTED = "submitted",
  PROCESSING = "processing",
  CLOSED = "closed",
}

export enum InquiryAction {
  CONTINUE = "continue",
  SUBMIT = "submit",
}

export enum InquiryTradeTerm {
  EXW = "EXW",
  FOB = "FOB",
  CFR = "CFR",
  CIF = "CIF",
  DDP = "DDP",
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
