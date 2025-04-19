# مشروع: نظام إدارة العملاء والطلبات والمخازن المتكامل مع Google Sheets

## التقنيات المستخدمة
- **الواجهة الأمامية:** React.js + Tailwind CSS/Material UI
- **الخلفية:** Node.js + Express.js
- **المصادقة:** Google OAuth/Firebase Auth
- **إدارة الجلسات:** Redis
- **تكامل مباشر مع Google Sheets API**
- **النشر والتوسع:** Docker

## هيكلية Google Sheet
- **Sheet 1:** جداول (العملاء، الطلبات، المقاسات، التركيبات)
- **Sheet 2:** جدول المخزون
- يمكن إضافة جداول جديدة عند التوسع

## الميزات الرئيسية
- نظام إشعارات داخلي بين الأقسام مع تسجيل حالة الإشعار (NotificationSent)
- دعم رفع ملفات PDF، تخصيص النماذج، رسائل منبثقة
- قابلية التوسع وإضافة أقسام مستقبلية
- ألوان راقية (بني، بيج، أبيض)
- دعم تعدد المستخدمين والصلاحيات
- واجهة تحكم للمدير

## ملخص الخطة النهائية
تطبيق ويب احترافي لإدارة العملاء، الطلبات، المقاسات، التركيبات، والمخازن، يعتمد على Google Sheet واحد بصفحتين (Sheets)، مع نظام إشعارات داخلي يربط بين جميع الأقسام، وقابلية توسعة مستقبلية بإضافة جداول أو أعمدة جديدة حسب الحاجة.

### جداول Google Sheet:
#### العملاء (Clients)
| ClientID | Name | Phone | Address | Type | Notes | CreatedAt | UpdatedAt | IsActive |

#### الطلبات (Orders)
| OrderID | ClientID | OrderNumber | OrderType | ServiceTypes | InvoiceNumber | ContractNumber | Notes | DeliveryType | DeliveryBranch | Status | Priority | CreatedAt | UpdatedAt |

#### المقاسات (Measurements)
| MeasurementID | OrderID | ClientID | Status | AppointmentDate | AssignedTeam | PDFLink | Notes | NotificationSent | CreatedAt | UpdatedAt |

#### التركيبات (Installations)
| InstallationID | OrderID | ClientID | Status | AppointmentDate | AssignedTeam | ContractNumber | Notes | NotificationSent | CreatedAt | UpdatedAt |

#### المخزون (Inventory)
| ItemID | ItemName | Category | Quantity | Unit | Price | RelatedOrderID | CutOrderNumber | FactorySent | ExitPermitNumber | ContractNumber | Status | Notes | CreatedAt | UpdatedAt | NotificationSent |

## نظام الإشعارات
- إشعار تلقائي عند الحاجة لكل قسم.
- تسجيل حالة الإشعار في العمود المناسب.
- إشعارات Dashboard لكل قسم مع تصفية حسب الحالة.
- إشعارات عند تحديث حالة الطلب أو رفع ملف PDF.

## قابلية التوسع
- كل جدول يحتوي على أعمدة CreatedAt و UpdatedAt و Notes و IsActive/Status.
- يمكن إضافة جداول وأعمدة جديدة بسهولة.

## ملاحظة
جميع البيانات مخزنة في Google Sheet واحد فقط، وكل قسم له جدول منفصل داخل إحدى الصفحتين.
