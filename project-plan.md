# الخطة النهائية لمشروع إدارة العملاء والطلبات والمخازن المتكامل مع Google Sheets

## 1. ملخص المشروع
تطبيق ويب احترافي لإدارة العملاء، الطلبات، المقاسات، التركيبات، والمخازن، يعتمد على Google Sheet واحد فقط بصفحتين (Sheets)، مع نظام إشعارات داخلي يربط بين جميع الأقسام، وقابلية توسعة مستقبلية بإضافة جداول أو أعمدة جديدة حسب الحاجة.

## 2. هيكلية Google Sheet
### Sheet 1: بيانات العملاء والطلبات والمقاسات والتركيبات
#### جدول العملاء (Clients)
| ClientID | Name | Phone | Address | Type | Notes | CreatedAt | UpdatedAt | IsActive |

- ClientID: معرف فريد للعميل (رقم تسلسلي أو UUID)
- Type: أفراد / معرض / جملة / شركات / مهندسين (قائمة اختيار)
- IsActive: حالة العميل (نشط/غير نشط) لدعم الأرشفة مستقبلاً

#### جدول الطلبات (Orders)
| OrderID | ClientID | OrderNumber | OrderType | ServiceTypes | InvoiceNumber | ContractNumber | Notes | DeliveryType | DeliveryBranch | Status | Priority | CreatedAt | UpdatedAt |

- OrderType: عادي / VIP
- ServiceTypes: معاينة، قماش، اكسسوار، تركيب، نقل، تفصيل، صيانة (قائمة اختيار متعددة)
- DeliveryType: منزل / فرع
- Priority: عادي/VIP
- Status: جديد / قيد التنفيذ / مكتمل / ملغى

#### جدول المقاسات (Measurements)
| MeasurementID | OrderID | ClientID | Status | AppointmentDate | AssignedTeam | PDFLink | Notes | NotificationSent | CreatedAt | UpdatedAt |

- Status: بحاجة جدولة / مجدول / مكتمل
- PDFLink: رابط ملف PDF
- NotificationSent: هل تم إرسال إشعار للقسم

#### جدول التركيبات (Installations)
| InstallationID | OrderID | ClientID | Status | AppointmentDate | AssignedTeam | ContractNumber | Notes | NotificationSent | CreatedAt | UpdatedAt |

- Status: بحاجة جدولة / مجدول / مكتمل
- NotificationSent: هل تم إرسال إشعار للقسم

### Sheet 2: بيانات المخازن
#### جدول المخزون (Inventory)
| ItemID | ItemName | Category | Quantity | Unit | Price | RelatedOrderID | CutOrderNumber | FactorySent | ExitPermitNumber | ContractNumber | Status | Notes | CreatedAt | UpdatedAt | NotificationSent |

- Category: قماش، اكسسوار، ... (قائمة اختيار)
- RelatedOrderID: ربط الصنف بطلب محدد
- CutOrderNumber: رقم أمر التقطيع
- FactorySent: نعم/لا
- ExitPermitNumber: رقم إذن الخروج
- Status: متوفر / قيد التقطيع / أُرسل للمصنع / مستلم
- NotificationSent: هل تم إرسال إشعار للمخزن

## 3. نظام الإشعارات (Notifications System)
- إشعار تلقائي عند إنشاء طلب جديد يتضمن خدمة تخص قسمًا معينًا.
- تسجيل حالة الإشعار في العمود المناسب (NotificationSent).
- إشعارات Dashboard لكل قسم مع تصفية حسب الحالة.
- إشعارات عند تحديث حالة الطلب أو رفع ملف PDF.
- قابلية التوسع لتشمل البريد الإلكتروني أو Push.

## 4. قابلية التوسع
- كل جدول يحتوي على أعمدة CreatedAt و UpdatedAt و Notes و IsActive/Status.
- يمكن إضافة جداول وأعمدة جديدة بسهولة.
