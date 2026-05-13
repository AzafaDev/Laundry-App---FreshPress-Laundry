-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'super_admin', 'outlet_admin', 'worker', 'driver');

-- CreateEnum
CREATE TYPE "PickupRequestStatus" AS ENUM ('waiting_driver', 'driver_assigned', 'picked_up', 'cancelled');

-- CreateEnum
CREATE TYPE "LaundryPaymentStatus" AS ENUM ('unpaid', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "LaundryOrderStatus" AS ENUM ('menunggu_penjemputan_driver', 'laundry_sedang_menuju_outlet', 'laundry_telah_sampai_outlet', 'laundry_sedang_dicuci', 'laundry_sedang_disetrika', 'laundry_sedang_di_packing', 'menunggu_pembayaran', 'laundry_siap_diantar', 'laundry_sedang_dikirim_menuju_customer', 'laundry_telah_diterima_customer', 'dibatalkan');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'bank_transfer', 'wallet');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "ComplaintType" AS ENUM ('lost', 'damaged', 'mismatch', 'other');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'in_review', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('on_time', 'late', 'absent');

-- CreateEnum
CREATE TYPE "BypassRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAddress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "receiver_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "full_address" TEXT NOT NULL,
    "courier_note" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "max_service_km" DOUBLE PRECISION,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outlet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShift" (
    "user_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "shift_date" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserShift_pkey" PRIMARY KEY ("user_id","shift_id","shift_date")
);

-- CreateTable
CREATE TABLE "PickupRequest" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "assigned_outlet_id" TEXT,
    "assigned_driver_id" TEXT,
    "requested_time" TIMESTAMP(3) NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "scheduled_time_start" TEXT,
    "scheduled_time_end" TEXT,
    "status" "PickupRequestStatus" NOT NULL DEFAULT 'waiting_driver',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "PickupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryOrder" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "pickup_request_id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "outlet_admin_id" TEXT NOT NULL,
    "total_weight_kg" DOUBLE PRECISION,
    "payment_status" "LaundryPaymentStatus" NOT NULL DEFAULT 'unpaid',
    "order_status" "LaundryOrderStatus" NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "expected_quantity" INTEGER NOT NULL,
    "current_quantity" INTEGER,
    "price_per_item" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "outlet_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationProcess" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "items_input" JSONB,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "is_bypassed" BOOLEAN NOT NULL DEFAULT false,
    "bypass_request_id" TEXT,
    "started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "StationProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BypassRequest" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "station_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "resolved_by_admin_id" TEXT,
    "reason" TEXT NOT NULL,
    "admin_note" TEXT,
    "status" "BypassRequestStatus" NOT NULL DEFAULT 'pending',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "stationProcessId" TEXT,

    CONSTRAINT "BypassRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "check_in_time" TEXT,
    "check_out_time" TEXT,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'absent',
    "total_hours" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_method" "PaymentMethod",
    "gateway_transaction_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "type" "ComplaintType" NOT NULL,
    "description" TEXT NOT NULL,
    "file_url" TEXT,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StationProcessBypassRequests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StationProcessBypassRequests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserAddress_user_id_idx" ON "UserAddress"("user_id");

-- CreateIndex
CREATE INDEX "Shift_outlet_id_idx" ON "Shift"("outlet_id");

-- CreateIndex
CREATE INDEX "PickupRequest_customer_id_idx" ON "PickupRequest"("customer_id");

-- CreateIndex
CREATE INDEX "PickupRequest_assigned_outlet_id_idx" ON "PickupRequest"("assigned_outlet_id");

-- CreateIndex
CREATE INDEX "PickupRequest_assigned_driver_id_idx" ON "PickupRequest"("assigned_driver_id");

-- CreateIndex
CREATE INDEX "PickupRequest_status_idx" ON "PickupRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryOrder_order_number_key" ON "LaundryOrder"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryOrder_pickup_request_id_key" ON "LaundryOrder"("pickup_request_id");

-- CreateIndex
CREATE INDEX "LaundryOrder_outlet_id_idx" ON "LaundryOrder"("outlet_id");

-- CreateIndex
CREATE INDEX "LaundryOrder_customer_id_idx" ON "LaundryOrder"("customer_id");

-- CreateIndex
CREATE INDEX "LaundryOrder_order_status_idx" ON "LaundryOrder"("order_status");

-- CreateIndex
CREATE INDEX "OrderItem_order_id_idx" ON "OrderItem"("order_id");

-- CreateIndex
CREATE INDEX "Station_outlet_id_idx" ON "Station"("outlet_id");

-- CreateIndex
CREATE UNIQUE INDEX "StationProcess_bypass_request_id_key" ON "StationProcess"("bypass_request_id");

-- CreateIndex
CREATE INDEX "StationProcess_order_id_idx" ON "StationProcess"("order_id");

-- CreateIndex
CREATE INDEX "StationProcess_station_id_idx" ON "StationProcess"("station_id");

-- CreateIndex
CREATE INDEX "StationProcess_worker_id_idx" ON "StationProcess"("worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "BypassRequest_stationProcessId_key" ON "BypassRequest"("stationProcessId");

-- CreateIndex
CREATE INDEX "BypassRequest_order_id_idx" ON "BypassRequest"("order_id");

-- CreateIndex
CREATE INDEX "BypassRequest_status_idx" ON "BypassRequest"("status");

-- CreateIndex
CREATE INDEX "Attendance_user_id_idx" ON "Attendance"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_user_id_attendance_date_key" ON "Attendance"("user_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_order_id_key" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Payment_customer_id_idx" ON "Payment"("customer_id");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Complaint_order_id_idx" ON "Complaint"("order_id");

-- CreateIndex
CREATE INDEX "Complaint_customer_id_idx" ON "Complaint"("customer_id");

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "Notification"("created_at");

-- CreateIndex
CREATE INDEX "_StationProcessBypassRequests_B_index" ON "_StationProcessBypassRequests"("B");

-- AddForeignKey
ALTER TABLE "UserAddress" ADD CONSTRAINT "UserAddress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "UserAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_assigned_outlet_id_fkey" FOREIGN KEY ("assigned_outlet_id") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_assigned_driver_id_fkey" FOREIGN KEY ("assigned_driver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupRequest" ADD CONSTRAINT "PickupRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_pickup_request_id_fkey" FOREIGN KEY ("pickup_request_id") REFERENCES "PickupRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryOrder" ADD CONSTRAINT "LaundryOrder_outlet_admin_id_fkey" FOREIGN KEY ("outlet_admin_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "LaundryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Station" ADD CONSTRAINT "Station_outlet_id_fkey" FOREIGN KEY ("outlet_id") REFERENCES "Outlet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProcess" ADD CONSTRAINT "StationProcess_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "LaundryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProcess" ADD CONSTRAINT "StationProcess_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProcess" ADD CONSTRAINT "StationProcess_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationProcess" ADD CONSTRAINT "StationProcess_bypass_request_id_fkey" FOREIGN KEY ("bypass_request_id") REFERENCES "BypassRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BypassRequest" ADD CONSTRAINT "BypassRequest_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "LaundryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BypassRequest" ADD CONSTRAINT "BypassRequest_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "Station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BypassRequest" ADD CONSTRAINT "BypassRequest_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BypassRequest" ADD CONSTRAINT "BypassRequest_resolved_by_admin_id_fkey" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BypassRequest" ADD CONSTRAINT "BypassRequest_stationProcessId_fkey" FOREIGN KEY ("stationProcessId") REFERENCES "StationProcess"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "LaundryOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "LaundryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StationProcessBypassRequests" ADD CONSTRAINT "_StationProcessBypassRequests_A_fkey" FOREIGN KEY ("A") REFERENCES "BypassRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StationProcessBypassRequests" ADD CONSTRAINT "_StationProcessBypassRequests_B_fkey" FOREIGN KEY ("B") REFERENCES "StationProcess"("id") ON DELETE CASCADE ON UPDATE CASCADE;
