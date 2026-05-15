Project 05
Laundry Web App

The following document is the main guide and instructions for final project development. Each feature listed should be further developed and researched by looking at similar projects. Critical thinking is essential in analyzing and developing the features mentioned in this document.
Description
Project ini akan dikerjakan oleh satu grup beranggotakan tiga orang. Pembagian fitur untuk setiap anggotanya sesuai dengan fitur utama yang dipilih. Total poin yang dapat diterima oleh masing masing student adalah 100 poin, yang mana akan dibagi secara merata bobotnya pada setiap fitur yang dikerjakan. Semua fitur wajib untuk dikerjakan untuk bisa mendapatkan nilai yang maksimal.
Main Features
Laundry Web App adalah sebuah aplikasi e-commerce yang memiliki fungsi agar customer dapat me-laundry pakaiannya tanpa harus datang langsung ke outlet (terdapat fitur pengambilan dan pengiriman dari pihak laundry). Adapun outlet laundry ini memiliki beberapa cabang dengan lokasi yang berbeda-beda. Sehingga customer dapat dilayani oleh outlet yang memiliki lokasi paling dekat. 
Pada aplikasi ini terdapat 4 jenis pengguna, diantaranya customer yang akan melaundry, worker dan admin sebagai pengelola outlet laundry, serta driver yang bertugas untuk melakukan pengambilan ataupun pengiriman laundry. 
Ketika ada pesanan baru, maka secara otomatis sistem akan meneruskan pemesanan tersebut ke lokasi outlet terdekat dengan alamat customer. Admin yang bertugas pada outlet tersebut, bertanggung jawab untuk memproses pesanan hingga selesai. 
· Membuat aplikasi berbasis web dengan mobile first approach.
· Aplikasi memiliki 5 jenis role, yaitu customer, super admin, outlet admin, worker dan driver.
· Saat landing page di akses, user akan diminta untuk memberikan izin mendapatkan lokasi (longitude dan latitude) pada saat pertama kali mengakses web.
· User dapat melakukan request pickup laundry, tracking order process dan juga pembayaran.
· Pesanan yang masuk secara otomatis akan diteruskan ke outlet admin yang sedang melakukan shift pada outlet yang lokasinya paling dekat dengan customer. Disisi lain, driver juga dapat mengambil tiap request pickup yang masuk. 
· Sebelum memproses order, outlet admin wajib melakukan input total kilo dan juga quantity tiap item pakaian yang akan di laundry.  Contoh: 
o Kaos (2 pcs)
o Celana Panjang (1 pcs)
o Celana Pendek (5 pcs)
o Celana Dalam (10 pcs)
· Setelah order dibuat, maka akan muncul tagihan yang dapat dibayarkan oleh customer.
· Terdapat beberapa station untuk memproses order tersebut, diantaranya:
· Washing Station
· Ironing Station
· Packing Station
· Key Points:
o Tentukan batas jarak suatu outlet dapat melayani order customer.
o Driver tidak dapat melakukan pickup baru ketika sedang melakukan proses pickup/delivery (hanya bisa satu order dalam satu waktu).
· Setiap station akan di handle oleh worker yang berbeda-beda.
· Setiap worker station wajib melakukan input ulang quantity tiap item pakaian yang akan di proses. 
· Apabila quantity tiap item pakaian tidak sama dengan station sebelumnya, maka worker pada station tersebut harus melakukan request bypass ke outlet admin agar dapat melanjutkan proses pengerjaan. 
· Untuk mem-bypass, outlet admin wajib melakukan authentication dan memberikan keterangan problem apa yang sedang terjadi.
Customer
· Customer dapat melakukan request pickup laundry. Jika ingin melakukan request pickup, customer diwajibkan sudah memiliki akun pada aplikasi. Jika user belum memiliki akun, maka diwajibkan untuk mendaftar terlebih dahulu
· Customer dapat melihat status dari order yang ada
· Customer dapat melakukan payment terhadap order yang dibuat
· Customer dapat melakukan komplain apabila laundry yang diterima tidak sesuai atau ada kerusakan dan kehilangan
Driver
· Driver dapat mengambil dan memproses request pickup yang masuk ataupun request delivery yang masuk
Worker
· Worker berperan sebagai penanggung jawab proses order, mulai dari washing, ironing dan juga packing pada tiap outlet. Hanya worker yang sedang bertugas pada shift tersebut yang dapat melakukan processing order.
· Worker dibagi menjadi 3 jenis: washing worker, ironing worker dan packing worker
· Tiap worker station wajib melakukan input quantity ulang item pakaian apa saja yang akan di proses
· Apabila item pakaian yang diproses jumlahnya tidak sesuai dengan station sebelumnya, maka worker wajib melakukan request access ke outlet admin agar dapat melanjutkan pekerjaannya
· Ketika semua proses di semua station selesai, maka secara otomatis akan muncul request delivery pada driver
Admin
· Admin berperan sebagai pengelola outlet
· Admin dibagi menjadi 2 jenis, yaitu super admin dan outlet admin
· Super admin bertugas untuk mengatur pembuatan master data dan dapat melihat keseluruhan data dari semua outlet
· Outlet admin bertugas untuk membuat order based on pickup request. Order yang dibuat wajib melakukan input total kilo dan quantity item pakaian apa saja yang akan di laundry
Order Statuses
Berikut ini beberapa status order yang ada pada aplikasi. Tidak menutup kemungkinan untuk menyesuaikan status pesanannya masing masing.
· Menunggu Penjemputan Driver
o Status ketika user pertama kali melakukan request pickup
· Laundry Sedang Menuju Outlet
o Status ketika driver telah melakukan pengambilan laundry
· Laundry Telah Sampai Outlet
o Status ketika laundry telah diterima oleh outlet admin dan outlet admin telah melakukan create order.
· Laundry Sedang Dicuci
o Status ketika laundry telah diserahkan oleh outlet admin dan akan dicuci oleh washing worker
· Laundry Sedang Disetrika
o Status ketika laundry telah dicuci dan akan disetrika oleh ironing worker 
· Laundry Sedang Di Packing
o Status ketika laundry telah disetrika dan akan di packing oleh packing worker
· Menunggu Pembayaran
o Status ketika laundry telah selesai dikerjakan
· Laundry Siap Diantar
o Status ketika laundry sudah siap diantar
· Laundry Sedang Dikirim Menuju Customer
o Status ketika pembayaran telah berhasil dan laundry sedang dikirim ke alamat customer
· Laundry Telah Diterima Customer
o Status ketika laundry telah sampai ke customer
Features
Feature 1
Homepage / Landing Page (10 Point)
Homepage / landing page ini adalah halaman awal yang akan muncul ketika aplikasi diakses. Pada fitur ini student diminta untuk membuat :

· Homepage / Landing Page
o Navigation bar : berisikan menu-menu utama dari aplikasi yang akan dibuat.
o Hero section : berisikan informasi umum atau promosi dalam bentuk carousel
o Register / Login : menampilkan button untuk melakukan registrasi atau login
o Footer : berisikan informasi tambahan dari aplikasi yang dibuat.
User Authentication and Profiles (35 Point)
Fitur ini berfokus pada proses autentikasi user, mulai dari registrasi hingga update profile. Student diminta untuk membuat :

· User Authorization
o User yang belum terdaftar dan terverifikasi, akan di-redirect ke homepage ketika akses halaman yang seharusnya tidak diperbolehkan untuk diakses (misalnya halaman profil atau halaman pickup)
o Untuk fitur tertentu yang tidak bisa digunakan (misal request pickup), maka akan disabled
o Muncul keterangan atau notifikasi bahwa user belum terdaftar atau belum terverifikasi
· User Registration
o User dapat melakukan registrasi pada aplikasi
o Proses registrasi bisa menggunakan email dan menggunakan social login (google / fb / twitter dll)
o User tidak dapat menggunakan email yang sudah terdaftar
o Untuk registrasi menggunakan email, tidak perlu untuk memasukan password pada tahap ini
o Untuk registrasi menggunakan email, user akan dikirimkan email untuk dapat memverifikasi data dan juga memasukan password
· Email Verification and Set Password
o Setelah proses registrasi, terdapat proses verifikasi user yang dikirimkan melalui email
o Verifikasi hanya boleh dilakukan sekali dan memiliki batas waktu maksimal satu jam setelah email dikirim. Jika sudah lewat dari satu jam, user dapat melakukan verifikasi ulang dengan memasukan email yang telah didaftarkan sebelumnya 
o Pada halaman verifikasi, disediakan juga sebuah form untuk memasukan password
o Proses verifikasi dilakukan bersamaan dengan memasukan password
o Password harus di enkripsi di database
o User akan diminta untuk login kembali setelah proses verifikasi selesai
o User yang belum terverifikasi tidak bisa membuat pesanan
o User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
· User Login
o User dapat login ke dalam aplikasi menggunakan email dan password atau social login
o Setelah login, user akan di redirect ke halaman terakhir sebelum login
· Reset Password
o User dapat mereset password mereka melalui fitur reset password
o Pada saat di-submit, akan dikirimkan email untuk memproses reset password
o Reset password hanya boleh dilakukan sekali per request
o Terdapat dua halaman :
§ Reset Password → untuk mengisi data email yang akan direset dan proses pengiriman link reset password ke email yang sesuai
§ Confirm Reset Password → untuk mengkonfirmasi reset password serta memasukan password yang baru
o Fitur ini hanya dapat digunakan untuk user yang melakukan registrasi menggunakan email dan password (bukan social login)
· User Profile
o User dapat melihat detail profil mereka.
o User dapat memperbarui data personal, termasuk password dan juga foto profil.
o Validasi terhadap foto yang diupload, ekstensi yang diperbolehkan hanya .jpg, .jpeg, .png dan .gif dan juga maksimum ukurannya adalah 1MB.
o User dapat memperbarui email, tetapi wajib untuk diverifikasi ulang
o User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
User Address (10 Point)
User dapat menambah, mengupdate dan menghapus alamat mereka. Pada fitur ini student diminta untuk membuat :

· Manage User Address
o User dapat memiliki lebih dari satu alamat
o User dapat menghapus dan memperbarui alamat yang sudah disimpan sebelumnya
o User dapat mengatur sebuah alamat menjadi alamat utama pada aplikasi
Pickup Order, Order Tracking and Payment  (35 Point)
Pada fitur ini, user dapat melakukan request untuk pickup laundry mereka. Disini user wajib untuk mengisi alamat penjemputan beserta jadwalnya. Selain itu user juga dapat memantau dan melunasi order mereka.

Pada fitur ini student akan diminta untuk membuat :

· Create Pickup Order
o User dapat melakukan request pickup baru berdasarkan alamat yang dipilih beserta jadwalnya
o Proses pencarian outlet terdekat berdasarkan titik koordinat antara alamat user dan outlet-outlet yang tersedia
o Ketika ada request pickup yang masuk ke salah satu outlet, maka driver pada outlet tersebut dapat mengambil order. Driver hanya dapat melakukan penjemputan atau pengantaran satu order dalam satu waktu.
o Setelah pickup laundry telah sampai di outlet, maka admin outlet bertugas untuk melanjutkan pembuatan pesanan serta wajib melakukan input total kilo dan quantity tiap item yang akan di laundry
o User dapat melakukan pembayaran ketika admin outlet telah memproses order tersebut. Batas akhir pembayaran user sampai dengan proses packing selesai. Apabila user tidak segera membayar hingga batas akhir yang sudah ditentukan, maka user akan mendapatkan notifikasi secara otomatis untuk segera menyelesaikan pembayarannya
o Ketika proses pengerjaan telah selesai dan user telah melakukan pembayaran, maka secara otomatis akan muncul request pengantaran pada driver.
· Order List
o Customer dapat melihat daftar pesanan yang sedang berlangsung maupun yang sudah selesai (sesuai dengan status pesanan yang tersedia)
o Customer dapat mencari pesanan berdasarkan tanggal dan no order/no invoice 
· Order Payment
o Customer dapat melakukan pembayaran pada pesanan yang telah diproses.
o Gunakan payment gateway untuk melunasi pembayaran.
o Jika customer tidak melakukan pembayaran, maka pesanan tidak akan diantar.
· Order Confirmation 
o Customer dapat konfirmasi order apabila laundry telah diterima
o Order akan otomatis di konfirmasi ketika customer tidak mengubah statusnya selama 2 x 24 jam setelah laundry dikirimkan
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.
Feature 2
Admin Account Management (10 Point)
Untuk bisa masuk ke dalam admin dashboard, data user dengan role admin harus dibuat terlebih dahulu. Pada fitur ini student diminta untuk membuat :

· Admin Authorization
o Hanya user dengan role admin yang dapat masuk ke dalam admin dashboard
· Manage User Data
o Admin dapat melihat, membuat, memperbarui dan menghapus data user dengan role outlet admin, worker ataupun driver
o Admin dapat melihat semua data user yang telah teregistrasi (bukan hanya admin)
o Hanya admin yang bisa mengakses menu ini
Outlet Management (20 Point)
Admin dapat mengatur outlet, detail lokasi serta akses kepada outlet tersebut. Data outlet ini juga akan terhubung dengan data outlet admin, worker dan juga driver yang bekerja pada outlet tersebut. Pada fitur ini student diminta untuk membuat :

· Outlet Management
o Admin dapat melihat, membuat, memperbarui dan menghapus data outlet
o Admin dapat menentukan titik lokasi outlet secara detail
o Outlet admin  tidak dapat mengakses fitur ini
· Laundry Item Management
o Admin dapat melihat, membuat, memperbarui dan menghapus laundry item seperti baju, celana panjang, celana pendek, celana dalam, dan lainnya
· Assign Outlet Admin, Worker and Driver
o Admin dapat menempatkan outlet admin, worker dan driver pada outlet tertentu
o Outlet admin  tidak dapat mengakses fitur ini
Order Management (40 Point)
Admin dapat melihat dan mengatur pesanan yang telah dibuat oleh user. Pada fitur ini student akan diminta untuk membuat:

· Show All Order
o Admin dapat melihat semua pesanan user untuk semua outlet, dan dapat memfilter pesanan berdasarkan outlet yang dipilih
o Outlet admin hanya dapat melihat pesanan pada outlet masing masing
o Pesanan dengan status dikirim nantinya akan menunggu konfirmasi dari user, baru kemudian pesanan dianggap selesai
o Outlet admin dapat melakukan tracking terhadap order yang dibuat di outlet tersebut berdasarkan status ordernya, karyawan yang mengerjakan dan juga tanggal prosesnya
· Create Orders
o Outlet admin bertugas untuk memproses order berdasarkan pickup request
o Pada saat create order, outlet admin wajib melakukan input total kilo dan juga quantity  item tiap pakaian yang akan di laundry
· Bypass Process
o Untuk kasus item pakaian yang kurang, maka tiap worker wajib melakukan request access kepada outlet admin agar dapat melanjutkan proses pengerjaannya. 
o Outlet admin dapat menyetujui atau menolak request tersebut.
o Jika request ditolak, maka worker wajib mengisi data hingga benar
o Jika request disetujui, maka proses akan berlanjut ke station berikutnya
Report & Analysis (20 Point)
· Sales Report
o Admin dapat melihat laporan income untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
o Outlet admin hanya dapat melihat laporan pada outlet masing masing
o Laporan yang perlu disediakan :
§ Laporan income per hari / bulan / tahun
· Employee Performance Report
o Admin dapat melihat laporan performa karyawan untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
o Outlet admin hanya dapat melihat laporan pada outlet masing masing
o Laporan yang perlu disediakan :
§ Laporan total pekerjaan permasing karyawan (worker / driver)
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Feature 3
Driver and Worker Attendance (20 Point)
Driver dan worker wajib untuk melakukan absensi setiap harinya sebelum bisa memproses pesanan. Pada fitur ini student diminta untuk membuat : 
· Submit Attendance
o Menambahkan proses untuk absen datang dan pulang setiap harinya
· Attendance Log
o Driver dan worker dapat melihat history absensi mereka masing masing
· Attendance Report
o Admin outlet dapat melihat laporan absensi setiap karyawannya
Driver Management (20 Point)
Driver dapat mengambil request pickup yang dilakukan oleh user ataupun mengantarkan laundry yang sudah siap diantar. Pada fitur ini student akan diminta untuk membuat:

· Pickup/Delivery Request List
· Driver dapat menerima notifikasi apabila ada request pickup/delivery yang masuk
· Driver dapat melihat daftar pesanan yang ada
· Process Pickup/Delivery
o Driver dapat memproses order yang ada
o Driver hanya dapat memproses satu pesanan dalam satu waktu
· Pickup/Delivery History
· Driver dapat melihat history pickup and delivery 
Worker Management (50 Point)
Worker dapat menerima notifikasi setiap ada laundry yang masuk ke station yang dihandle oleh worker.
Pada fitur ini student akan diminta untuk membuat:

· Order List
o Worker menerima notifikasi apabila ada laundry yang masuk ke station nya
o Worker dapat melihat daftar pesanan yang ada
· Processing Order
o Worker dapat memproses pesanan yang masuk dan wajib input ulang item laundry apa saja yang akan dikerjakan
o Jika yang diinput tidak sesuai, maka tidak dapat diproses
o Jika yang diinput tidak sesuai, maka harus request untuk bypass kepada admin untuk dapat melanjutkan proses
o Setelah proses input ulang item selesai, selanjutnya worker bisa menyelesaikan pesanan dan pesanan akan masuk ke station selanjutnya
o Khusus untuk station packing, jika ternyata pesanan belum lunas maka status pesanan akan menjadi “Menunggu Pembayaran”. Tetapi jika sudah lunas maka status akan menjadi “Laundry Siap Diantar”
· Show Job History
o Worker dapat melihat history pekerjaan nya

Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Mentor Evaluation
Mentor memiliki hak untuk memberikan penilaian secara subjective terhadap hasil kerja student pada final project development. Bobot nilai dari mentor adalah 10 poin. Penilaiannya akan mencakup :

· Kerapian tampilan UI
· Komunikasi dengan anggota team
· Inisiatif
· Pengembangan fitur
References
Student dapat menggunakan tools di bawah ini untuk membantu menentukan lokasi dan menentukan harga pengiriman.
· Dapat menggunakan API RajaOngkir atau free API lainnya untuk menentukan provinsi, kota dan kecamatan
· Dapat menggunakan OpenCage atau free API lainnya untuk mendapatkan posisi geolocation berdasarkan provinsi dan kota
Standardization
Harap perhatikan poin poin dibawah ini, dan wajib untuk di implementasi. Akan ada pengecekan dan penilaian oleh juri untuk poin poin disini.
Validation
· Semua input dari user harus divalidasi (client dan server)
· Untuk input yang berupa file (bisa juga gambar), harus divalidasi extensionnya dan juga ukuran file yang bisa diterima
· Semua proses yang krusial, harus ada approval dari user terlebih dahulu sebelum di proses (misalkan hapus data tertentu)
Pagination, Filtering and Sorting
· Semua tampilan dalam bentuk list (misalnya product list, order list atau user list) harus menggunakan pagination, filter dan sort. Semuanya diproses di server (tidak diperbolehkan untuk diproses di client)
Frontend
· Wajib responsive minimal ukuran mobile dan web
· Design yang digunakan dapat dimengerti oleh penguji maupun user umum yang akan menggunakan web app tersebut
· Tampilan dibuat semenarik mungkin, bukan sesederhana nya
· Penamaan file harus jelas, merepresentasikan kegunaannya
· Perhatikan penggunaan ekstensi file (jsx di gunakan ketika ada unsur html di dalam js)
· Title dan favicon disesuaikan dengan project yang dikerjakan
Backend
· Penggunaan method rest api yang sesuai dengan kaidah nya merujuk ke sini
· Terapkan authorization pada api yang hanya bisa diakses oleh user tertentu
Clean Code
· Dalam setiap file, maksimal baris code adalah 200 baris. Jika lebih harus di-refactor terlebih dahulu
· Penggunaan log yang tidak terpakai harus dibersihkan sebelum masuk ke production
· Penggunaan code yang tidak terpakai harus dibersihkan
· Penulisan function maksimal 15 baris, jika lebih harus di re-factor

Project 05
Laundry Web App

The following document is the main guide and instructions for final project development. Each feature listed should be further developed and researched by looking at similar projects. Critical thinking is essential in analyzing and developing the features mentioned in this document.

Description
Project ini akan dikerjakan oleh satu grup beranggotakan tiga orang. Pembagian fitur untuk setiap anggotanya sesuai dengan fitur utama yang dipilih. Total poin yang dapat diterima oleh masing masing student adalah 100 poin, yang mana akan dibagi secara merata bobotnya pada setiap fitur yang dikerjakan. Semua fitur wajib untuk dikerjakan untuk bisa mendapatkan nilai yang maksimal.
Main Features
Laundry Web App adalah sebuah aplikasi e-commerce yang memiliki fungsi agar customer dapat me-laundry pakaiannya tanpa harus datang langsung ke outlet (terdapat fitur pengambilan dan pengiriman dari pihak laundry). Adapun outlet laundry ini memiliki beberapa cabang dengan lokasi yang berbeda-beda. Sehingga customer dapat dilayani oleh outlet yang memiliki lokasi paling dekat.
Pada aplikasi ini terdapat 4 jenis pengguna, diantaranya customer yang akan melaundry, worker dan admin sebagai pengelola outlet laundry, serta driver yang bertugas untuk melakukan pengambilan ataupun pengiriman laundry.
Ketika ada pesanan baru, maka secara otomatis sistem akan meneruskan pemesanan tersebut ke lokasi outlet terdekat dengan alamat customer. Admin yang bertugas pada outlet tersebut, bertanggung jawab untuk memproses pesanan hingga selesai.
Membuat aplikasi berbasis web dengan mobile first approach.
Aplikasi memiliki 5 jenis role, yaitu customer, super admin, outlet admin, worker dan driver.
Saat landing page di akses, user akan diminta untuk memberikan izin mendapatkan lokasi (longitude dan latitude) pada saat pertama kali mengakses web.
User dapat melakukan request pickup laundry, tracking order process dan juga pembayaran.
Pesanan yang masuk secara otomatis akan diteruskan ke outlet admin yang sedang melakukan shift pada outlet yang lokasinya paling dekat dengan customer. Disisi lain, driver juga dapat mengambil tiap request pickup yang masuk.
Sebelum memproses order, outlet admin wajib melakukan input total kilo dan juga quantity tiap item pakaian yang akan di laundry. Contoh:
Kaos (2 pcs)
Celana Panjang (1 pcs)
Celana Pendek (5 pcs)
Celana Dalam (10 pcs)
Setelah order dibuat, maka akan muncul tagihan yang dapat dibayarkan oleh customer.
Terdapat beberapa station untuk memproses order tersebut, diantaranya:
Washing Station
Ironing Station
Packing Station
Key Points:
Tentukan batas jarak suatu outlet dapat melayani order customer.
Driver tidak dapat melakukan pickup baru ketika sedang melakukan proses pickup/delivery (hanya bisa satu order dalam satu waktu).
Setiap station akan di handle oleh worker yang berbeda-beda.
Setiap worker station wajib melakukan input ulang quantity tiap item pakaian yang akan di proses.
Apabila quantity tiap item pakaian tidak sama dengan station sebelumnya, maka worker pada station tersebut harus melakukan request bypass ke outlet admin agar dapat melanjutkan proses pengerjaan.
Untuk mem-bypass, outlet admin wajib melakukan authentication dan memberikan keterangan problem apa yang sedang terjadi.
Customer
Customer dapat melakukan request pickup laundry. Jika ingin melakukan request pickup, customer diwajibkan sudah memiliki akun pada aplikasi. Jika user belum memiliki akun, maka diwajibkan untuk mendaftar terlebih dahulu
Customer dapat melihat status dari order yang ada
Customer dapat melakukan payment terhadap order yang dibuat
Customer dapat melakukan komplain apabila laundry yang diterima tidak sesuai atau ada kerusakan dan kehilangan
Driver
Driver dapat mengambil dan memproses request pickup yang masuk ataupun request delivery yang masuk
Worker
Worker berperan sebagai penanggung jawab proses order, mulai dari washing, ironing dan juga packing pada tiap outlet. Hanya worker yang sedang bertugas pada shift tersebut yang dapat melakukan processing order.
Worker dibagi menjadi 3 jenis: washing worker, ironing worker dan packing worker
Tiap worker station wajib melakukan input quantity ulang item pakaian apa saja yang akan di proses
Apabila item pakaian yang diproses jumlahnya tidak sesuai dengan station sebelumnya, maka worker wajib melakukan request access ke outlet admin agar dapat melanjutkan pekerjaannya
Ketika semua proses di semua station selesai, maka secara otomatis akan muncul request delivery pada driver
Admin
Admin berperan sebagai pengelola outlet
Admin dibagi menjadi 2 jenis, yaitu super admin dan outlet admin
Super admin bertugas untuk mengatur pembuatan master data dan dapat melihat keseluruhan data dari semua outlet
Outlet admin bertugas untuk membuat order based on pickup request. Order yang dibuat wajib melakukan input total kilo dan quantity item pakaian apa saja yang akan di laundry
Order Statuses
Berikut ini beberapa status order yang ada pada aplikasi. Tidak menutup kemungkinan untuk menyesuaikan status pesanannya masing masing.
Menunggu Penjemputan Driver
Status ketika user pertama kali melakukan request pickup
Laundry Sedang Menuju Outlet
Status ketika driver telah melakukan pengambilan laundry
Laundry Telah Sampai Outlet
Status ketika laundry telah diterima oleh outlet admin dan outlet admin telah melakukan create order.
Laundry Sedang Dicuci
Status ketika laundry telah diserahkan oleh outlet admin dan akan dicuci oleh washing worker
Laundry Sedang Disetrika
Status ketika laundry telah dicuci dan akan disetrika oleh ironing worker
Laundry Sedang Di Packing
Status ketika laundry telah disetrika dan akan di packing oleh packing worker
Menunggu Pembayaran
Status ketika laundry telah selesai dikerjakan
Laundry Siap Diantar
Status ketika laundry sudah siap diantar
Laundry Sedang Dikirim Menuju Customer
Status ketika pembayaran telah berhasil dan laundry sedang dikirim ke alamat customer
Laundry Telah Diterima Customer
Status ketika laundry telah sampai ke customer
Features
Feature 1
Homepage / Landing Page (10 Point)
Homepage / landing page ini adalah halaman awal yang akan muncul ketika aplikasi diakses. Pada fitur ini student diminta untuk membuat :

Homepage / Landing Page
Navigation bar : berisikan menu-menu utama dari aplikasi yang akan dibuat.
Hero section : berisikan informasi umum atau promosi dalam bentuk carousel
Register / Login : menampilkan button untuk melakukan registrasi atau login
Footer : berisikan informasi tambahan dari aplikasi yang dibuat.
User Authentication and Profiles (35 Point)
Fitur ini berfokus pada proses autentikasi user, mulai dari registrasi hingga update profile. Student diminta untuk membuat :

User Authorization
User yang belum terdaftar dan terverifikasi, akan di-redirect ke homepage ketika akses halaman yang seharusnya tidak diperbolehkan untuk diakses (misalnya halaman profil atau halaman pickup)
Untuk fitur tertentu yang tidak bisa digunakan (misal request pickup), maka akan disabled
Muncul keterangan atau notifikasi bahwa user belum terdaftar atau belum terverifikasi
User Registration
User dapat melakukan registrasi pada aplikasi
Proses registrasi bisa menggunakan email dan menggunakan social login (google / fb / twitter dll)
User tidak dapat menggunakan email yang sudah terdaftar
Untuk registrasi menggunakan email, tidak perlu untuk memasukan password pada tahap ini
Untuk registrasi menggunakan email, user akan dikirimkan email untuk dapat memverifikasi data dan juga memasukan password
Email Verification and Set Password
Setelah proses registrasi, terdapat proses verifikasi user yang dikirimkan melalui email
Verifikasi hanya boleh dilakukan sekali dan memiliki batas waktu maksimal satu jam setelah email dikirim. Jika sudah lewat dari satu jam, user dapat melakukan verifikasi ulang dengan memasukan email yang telah didaftarkan sebelumnya
Pada halaman verifikasi, disediakan juga sebuah form untuk memasukan password
Proses verifikasi dilakukan bersamaan dengan memasukan password
Password harus di enkripsi di database
User akan diminta untuk login kembali setelah proses verifikasi selesai
User yang belum terverifikasi tidak bisa membuat pesanan
User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
User Login
User dapat login ke dalam aplikasi menggunakan email dan password atau social login
Setelah login, user akan di redirect ke halaman terakhir sebelum login
Reset Password
User dapat mereset password mereka melalui fitur reset password
Pada saat di-submit, akan dikirimkan email untuk memproses reset password
Reset password hanya boleh dilakukan sekali per request
Terdapat dua halaman :
Reset Password → untuk mengisi data email yang akan direset dan proses pengiriman link reset password ke email yang sesuai
Confirm Reset Password → untuk mengkonfirmasi reset password serta memasukan password yang baru
Fitur ini hanya dapat digunakan untuk user yang melakukan registrasi menggunakan email dan password (bukan social login)
User Profile
User dapat melihat detail profil mereka.
User dapat memperbarui data personal, termasuk password dan juga foto profil.
Validasi terhadap foto yang diupload, ekstensi yang diperbolehkan hanya .jpg, .jpeg, .png dan .gif dan juga maksimum ukurannya adalah 1MB.
User dapat memperbarui email, tetapi wajib untuk diverifikasi ulang
User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
User Address (10 Point)
User dapat menambah, mengupdate dan menghapus alamat mereka. Pada fitur ini student diminta untuk membuat :

Manage User Address
User dapat memiliki lebih dari satu alamat
User dapat menghapus dan memperbarui alamat yang sudah disimpan sebelumnya
User dapat mengatur sebuah alamat menjadi alamat utama pada aplikasi
Pickup Order, Order Tracking and Payment (35 Point)
Pada fitur ini, user dapat melakukan request untuk pickup laundry mereka. Disini user wajib untuk mengisi alamat penjemputan beserta jadwalnya. Selain itu user juga dapat memantau dan melunasi order mereka.

Pada fitur ini student akan diminta untuk membuat :

Create Pickup Order
User dapat melakukan request pickup baru berdasarkan alamat yang dipilih beserta jadwalnya
Proses pencarian outlet terdekat berdasarkan titik koordinat antara alamat user dan outlet-outlet yang tersedia
Ketika ada request pickup yang masuk ke salah satu outlet, maka driver pada outlet tersebut dapat mengambil order. Driver hanya dapat melakukan penjemputan atau pengantaran satu order dalam satu waktu.
Setelah pickup laundry telah sampai di outlet, maka admin outlet bertugas untuk melanjutkan pembuatan pesanan serta wajib melakukan input total kilo dan quantity tiap item yang akan di laundry
User dapat melakukan pembayaran ketika admin outlet telah memproses order tersebut. Batas akhir pembayaran user sampai dengan proses packing selesai. Apabila user tidak segera membayar hingga batas akhir yang sudah ditentukan, maka user akan mendapatkan notifikasi secara otomatis untuk segera menyelesaikan pembayarannya
Ketika proses pengerjaan telah selesai dan user telah melakukan pembayaran, maka secara otomatis akan muncul request pengantaran pada driver.
Order List
Customer dapat melihat daftar pesanan yang sedang berlangsung maupun yang sudah selesai (sesuai dengan status pesanan yang tersedia)
Customer dapat mencari pesanan berdasarkan tanggal dan no order/no invoice
Order Payment
Customer dapat melakukan pembayaran pada pesanan yang telah diproses.
Gunakan payment gateway untuk melunasi pembayaran.
Jika customer tidak melakukan pembayaran, maka pesanan tidak akan diantar.
Order Confirmation
Customer dapat konfirmasi order apabila laundry telah diterima
Order akan otomatis di konfirmasi ketika customer tidak mengubah statusnya selama 2 x 24 jam setelah laundry dikirimkan
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.
Feature 2
Admin Account Management (10 Point)
Untuk bisa masuk ke dalam admin dashboard, data user dengan role admin harus dibuat terlebih dahulu. Pada fitur ini student diminta untuk membuat :

Admin Authorization
Hanya user dengan role admin yang dapat masuk ke dalam admin dashboard
Manage User Data
Admin dapat melihat, membuat, memperbarui dan menghapus data user dengan role outlet admin, worker ataupun driver
Admin dapat melihat semua data user yang telah teregistrasi (bukan hanya admin)
Hanya admin yang bisa mengakses menu ini
Outlet Management (20 Point)
Admin dapat mengatur outlet, detail lokasi serta akses kepada outlet tersebut. Data outlet ini juga akan terhubung dengan data outlet admin, worker dan juga driver yang bekerja pada outlet tersebut. Pada fitur ini student diminta untuk membuat :

Outlet Management
Admin dapat melihat, membuat, memperbarui dan menghapus data outlet
Admin dapat menentukan titik lokasi outlet secara detail
Outlet admin tidak dapat mengakses fitur ini
Laundry Item Management
Admin dapat melihat, membuat, memperbarui dan menghapus laundry item seperti baju, celana panjang, celana pendek, celana dalam, dan lainnya
Assign Outlet Admin, Worker and Driver
Admin dapat menempatkan outlet admin, worker dan driver pada outlet tertentu
Outlet admin tidak dapat mengakses fitur ini
Order Management (40 Point)
Admin dapat melihat dan mengatur pesanan yang telah dibuat oleh user. Pada fitur ini student akan diminta untuk membuat:

Show All Order
Admin dapat melihat semua pesanan user untuk semua outlet, dan dapat memfilter pesanan berdasarkan outlet yang dipilih
Outlet admin hanya dapat melihat pesanan pada outlet masing masing
Pesanan dengan status dikirim nantinya akan menunggu konfirmasi dari user, baru kemudian pesanan dianggap selesai
Outlet admin dapat melakukan tracking terhadap order yang dibuat di outlet tersebut berdasarkan status ordernya, karyawan yang mengerjakan dan juga tanggal prosesnya
Create Orders
Outlet admin bertugas untuk memproses order berdasarkan pickup request
Pada saat create order, outlet admin wajib melakukan input total kilo dan juga quantity item tiap pakaian yang akan di laundry
Bypass Process
Untuk kasus item pakaian yang kurang, maka tiap worker wajib melakukan request access kepada outlet admin agar dapat melanjutkan proses pengerjaannya.
Outlet admin dapat menyetujui atau menolak request tersebut.
Jika request ditolak, maka worker wajib mengisi data hingga benar
Jika request disetujui, maka proses akan berlanjut ke station berikutnya
Report & Analysis (20 Point)
Sales Report
Admin dapat melihat laporan income untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
Outlet admin hanya dapat melihat laporan pada outlet masing masing
Laporan yang perlu disediakan :
Laporan income per hari / bulan / tahun
Employee Performance Report
Admin dapat melihat laporan performa karyawan untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
Outlet admin hanya dapat melihat laporan pada outlet masing masing
Laporan yang perlu disediakan :
Laporan total pekerjaan permasing karyawan (worker / driver)
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Feature 3
Driver and Worker Attendance (20 Point)
Driver dan worker wajib untuk melakukan absensi setiap harinya sebelum bisa memproses pesanan. Pada fitur ini student diminta untuk membuat :
Submit Attendance
Menambahkan proses untuk absen datang dan pulang setiap harinya
Attendance Log
Driver dan worker dapat melihat history absensi mereka masing masing
Attendance Report
Admin outlet dapat melihat laporan absensi setiap karyawannya
Driver Management (20 Point)
Driver dapat mengambil request pickup yang dilakukan oleh user ataupun mengantarkan laundry yang sudah siap diantar. Pada fitur ini student akan diminta untuk membuat:

Pickup/Delivery Request List
Driver dapat menerima notifikasi apabila ada request pickup/delivery yang masuk
Driver dapat melihat daftar pesanan yang ada
Process Pickup/Delivery
Driver dapat memproses order yang ada
Driver hanya dapat memproses satu pesanan dalam satu waktu
Pickup/Delivery History
Driver dapat melihat history pickup and delivery
Worker Management (50 Point)
Worker dapat menerima notifikasi setiap ada laundry yang masuk ke station yang dihandle oleh worker.
Pada fitur ini student akan diminta untuk membuat:

Order List
Worker menerima notifikasi apabila ada laundry yang masuk ke station nya
Worker dapat melihat daftar pesanan yang ada
Processing Order
Worker dapat memproses pesanan yang masuk dan wajib input ulang item laundry apa saja yang akan dikerjakan
Jika yang diinput tidak sesuai, maka tidak dapat diproses
Jika yang diinput tidak sesuai, maka harus request untuk bypass kepada admin untuk dapat melanjutkan proses
Setelah proses input ulang item selesai, selanjutnya worker bisa menyelesaikan pesanan dan pesanan akan masuk ke station selanjutnya
Khusus untuk station packing, jika ternyata pesanan belum lunas maka status pesanan akan menjadi “Menunggu Pembayaran”. Tetapi jika sudah lunas maka status akan menjadi “Laundry Siap Diantar”
Show Job History
Worker dapat melihat history pekerjaan nya

Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Mentor Evaluation
Mentor memiliki hak untuk memberikan penilaian secara subjective terhadap hasil kerja student pada final project development. Bobot nilai dari mentor adalah 10 poin. Penilaiannya akan mencakup :

Kerapian tampilan UI
Komunikasi dengan anggota team
Inisiatif
Pengembangan fitur
References
Student dapat menggunakan tools di bawah ini untuk membantu menentukan lokasi dan menentukan harga pengiriman.
Dapat menggunakan API RajaOngkir atau free API lainnya untuk menentukan provinsi, kota dan kecamatan
Dapat menggunakan OpenCage atau free API lainnya untuk mendapatkan posisi geolocation berdasarkan provinsi dan kota
Standardization
Harap perhatikan poin poin dibawah ini, dan wajib untuk di implementasi. Akan ada pengecekan dan penilaian oleh juri untuk poin poin disini.
Validation
Semua input dari user harus divalidasi (client dan server)
Untuk input yang berupa file (bisa juga gambar), harus divalidasi extensionnya dan juga ukuran file yang bisa diterima
Semua proses yang krusial, harus ada approval dari user terlebih dahulu sebelum di proses (misalkan hapus data tertentu)
Pagination, Filtering and Sorting
Semua tampilan dalam bentuk list (misalnya product list, order list atau user list) harus menggunakan pagination, filter dan sort. Semuanya diproses di server (tidak diperbolehkan untuk diproses di client)
Frontend
Wajib responsive minimal ukuran mobile dan web
Design yang digunakan dapat dimengerti oleh penguji maupun user umum yang akan menggunakan web app tersebut
Tampilan dibuat semenarik mungkin, bukan sesederhana nya
Penamaan file harus jelas, merepresentasikan kegunaannya
Perhatikan penggunaan ekstensi file (jsx di gunakan ketika ada unsur html di dalam js)
Title dan favicon disesuaikan dengan project yang dikerjakan
Backend
Penggunaan method rest api yang sesuai dengan kaidah nya merujuk ke sini
Terapkan authorization pada api yang hanya bisa diakses oleh user tertentu
Clean Code
Dalam setiap file, maksimal baris code adalah 200 baris. Jika lebih harus di-refactor terlebih dahulu
Penggunaan log yang tidak terpakai harus dibersihkan sebelum masuk ke production
Penggunaan code yang tidak terpakai harus dibersihkan
Penulisan function maksimal 15 baris, jika lebih harus di re-factor

Project 05
Laundry Web App

The following document is the main guide and instructions for final project development. Each feature listed should be further developed and researched by looking at similar projects. Critical thinking is essential in analyzing and developing the features mentioned in this document.

Description
Project ini akan dikerjakan oleh satu grup beranggotakan tiga orang. Pembagian fitur untuk setiap anggotanya sesuai dengan fitur utama yang dipilih. Total poin yang dapat diterima oleh masing masing student adalah 100 poin, yang mana akan dibagi secara merata bobotnya pada setiap fitur yang dikerjakan. Semua fitur wajib untuk dikerjakan untuk bisa mendapatkan nilai yang maksimal.
Main Features
Laundry Web App adalah sebuah aplikasi e-commerce yang memiliki fungsi agar customer dapat me-laundry pakaiannya tanpa harus datang langsung ke outlet (terdapat fitur pengambilan dan pengiriman dari pihak laundry). Adapun outlet laundry ini memiliki beberapa cabang dengan lokasi yang berbeda-beda. Sehingga customer dapat dilayani oleh outlet yang memiliki lokasi paling dekat.
Pada aplikasi ini terdapat 4 jenis pengguna, diantaranya customer yang akan melaundry, worker dan admin sebagai pengelola outlet laundry, serta driver yang bertugas untuk melakukan pengambilan ataupun pengiriman laundry.
Ketika ada pesanan baru, maka secara otomatis sistem akan meneruskan pemesanan tersebut ke lokasi outlet terdekat dengan alamat customer. Admin yang bertugas pada outlet tersebut, bertanggung jawab untuk memproses pesanan hingga selesai.
Membuat aplikasi berbasis web dengan mobile first approach.
Aplikasi memiliki 5 jenis role, yaitu customer, super admin, outlet admin, worker dan driver.
Saat landing page di akses, user akan diminta untuk memberikan izin mendapatkan lokasi (longitude dan latitude) pada saat pertama kali mengakses web.
User dapat melakukan request pickup laundry, tracking order process dan juga pembayaran.
Pesanan yang masuk secara otomatis akan diteruskan ke outlet admin yang sedang melakukan shift pada outlet yang lokasinya paling dekat dengan customer. Disisi lain, driver juga dapat mengambil tiap request pickup yang masuk.
Sebelum memproses order, outlet admin wajib melakukan input total kilo dan juga quantity tiap item pakaian yang akan di laundry. Contoh:
Kaos (2 pcs)
Celana Panjang (1 pcs)
Celana Pendek (5 pcs)
Celana Dalam (10 pcs)
Setelah order dibuat, maka akan muncul tagihan yang dapat dibayarkan oleh customer.
Terdapat beberapa station untuk memproses order tersebut, diantaranya:
Washing Station
Ironing Station
Packing Station
Key Points:
Tentukan batas jarak suatu outlet dapat melayani order customer.
Driver tidak dapat melakukan pickup baru ketika sedang melakukan proses pickup/delivery (hanya bisa satu order dalam satu waktu).
Setiap station akan di handle oleh worker yang berbeda-beda.
Setiap worker station wajib melakukan input ulang quantity tiap item pakaian yang akan di proses.
Apabila quantity tiap item pakaian tidak sama dengan station sebelumnya, maka worker pada station tersebut harus melakukan request bypass ke outlet admin agar dapat melanjutkan proses pengerjaan.
Untuk mem-bypass, outlet admin wajib melakukan authentication dan memberikan keterangan problem apa yang sedang terjadi.
Customer
Customer dapat melakukan request pickup laundry. Jika ingin melakukan request pickup, customer diwajibkan sudah memiliki akun pada aplikasi. Jika user belum memiliki akun, maka diwajibkan untuk mendaftar terlebih dahulu
Customer dapat melihat status dari order yang ada
Customer dapat melakukan payment terhadap order yang dibuat
Customer dapat melakukan komplain apabila laundry yang diterima tidak sesuai atau ada kerusakan dan kehilangan
Driver
Driver dapat mengambil dan memproses request pickup yang masuk ataupun request delivery yang masuk
Worker
Worker berperan sebagai penanggung jawab proses order, mulai dari washing, ironing dan juga packing pada tiap outlet. Hanya worker yang sedang bertugas pada shift tersebut yang dapat melakukan processing order.
Worker dibagi menjadi 3 jenis: washing worker, ironing worker dan packing worker
Tiap worker station wajib melakukan input quantity ulang item pakaian apa saja yang akan di proses
Apabila item pakaian yang diproses jumlahnya tidak sesuai dengan station sebelumnya, maka worker wajib melakukan request access ke outlet admin agar dapat melanjutkan pekerjaannya
Ketika semua proses di semua station selesai, maka secara otomatis akan muncul request delivery pada driver
Admin
Admin berperan sebagai pengelola outlet
Admin dibagi menjadi 2 jenis, yaitu super admin dan outlet admin
Super admin bertugas untuk mengatur pembuatan master data dan dapat melihat keseluruhan data dari semua outlet
Outlet admin bertugas untuk membuat order based on pickup request. Order yang dibuat wajib melakukan input total kilo dan quantity item pakaian apa saja yang akan di laundry
Order Statuses
Berikut ini beberapa status order yang ada pada aplikasi. Tidak menutup kemungkinan untuk menyesuaikan status pesanannya masing masing.
Menunggu Penjemputan Driver
Status ketika user pertama kali melakukan request pickup
Laundry Sedang Menuju Outlet
Status ketika driver telah melakukan pengambilan laundry
Laundry Telah Sampai Outlet
Status ketika laundry telah diterima oleh outlet admin dan outlet admin telah melakukan create order.
Laundry Sedang Dicuci
Status ketika laundry telah diserahkan oleh outlet admin dan akan dicuci oleh washing worker
Laundry Sedang Disetrika
Status ketika laundry telah dicuci dan akan disetrika oleh ironing worker
Laundry Sedang Di Packing
Status ketika laundry telah disetrika dan akan di packing oleh packing worker
Menunggu Pembayaran
Status ketika laundry telah selesai dikerjakan
Laundry Siap Diantar
Status ketika laundry sudah siap diantar
Laundry Sedang Dikirim Menuju Customer
Status ketika pembayaran telah berhasil dan laundry sedang dikirim ke alamat customer
Laundry Telah Diterima Customer
Status ketika laundry telah sampai ke customer
Features
Feature 1
Homepage / Landing Page (10 Point)
Homepage / landing page ini adalah halaman awal yang akan muncul ketika aplikasi diakses. Pada fitur ini student diminta untuk membuat :

Homepage / Landing Page
Navigation bar : berisikan menu-menu utama dari aplikasi yang akan dibuat.
Hero section : berisikan informasi umum atau promosi dalam bentuk carousel
Register / Login : menampilkan button untuk melakukan registrasi atau login
Footer : berisikan informasi tambahan dari aplikasi yang dibuat.
User Authentication and Profiles (35 Point)
Fitur ini berfokus pada proses autentikasi user, mulai dari registrasi hingga update profile. Student diminta untuk membuat :

User Authorization
User yang belum terdaftar dan terverifikasi, akan di-redirect ke homepage ketika akses halaman yang seharusnya tidak diperbolehkan untuk diakses (misalnya halaman profil atau halaman pickup)
Untuk fitur tertentu yang tidak bisa digunakan (misal request pickup), maka akan disabled
Muncul keterangan atau notifikasi bahwa user belum terdaftar atau belum terverifikasi
User Registration
User dapat melakukan registrasi pada aplikasi
Proses registrasi bisa menggunakan email dan menggunakan social login (google / fb / twitter dll)
User tidak dapat menggunakan email yang sudah terdaftar
Untuk registrasi menggunakan email, tidak perlu untuk memasukan password pada tahap ini
Untuk registrasi menggunakan email, user akan dikirimkan email untuk dapat memverifikasi data dan juga memasukan password
Email Verification and Set Password
Setelah proses registrasi, terdapat proses verifikasi user yang dikirimkan melalui email
Verifikasi hanya boleh dilakukan sekali dan memiliki batas waktu maksimal satu jam setelah email dikirim. Jika sudah lewat dari satu jam, user dapat melakukan verifikasi ulang dengan memasukan email yang telah didaftarkan sebelumnya
Pada halaman verifikasi, disediakan juga sebuah form untuk memasukan password
Proses verifikasi dilakukan bersamaan dengan memasukan password
Password harus di enkripsi di database
User akan diminta untuk login kembali setelah proses verifikasi selesai
User yang belum terverifikasi tidak bisa membuat pesanan
User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
User Login
User dapat login ke dalam aplikasi menggunakan email dan password atau social login
Setelah login, user akan di redirect ke halaman terakhir sebelum login
Reset Password
User dapat mereset password mereka melalui fitur reset password
Pada saat di-submit, akan dikirimkan email untuk memproses reset password
Reset password hanya boleh dilakukan sekali per request
Terdapat dua halaman :
Reset Password → untuk mengisi data email yang akan direset dan proses pengiriman link reset password ke email yang sesuai
Confirm Reset Password → untuk mengkonfirmasi reset password serta memasukan password yang baru
Fitur ini hanya dapat digunakan untuk user yang melakukan registrasi menggunakan email dan password (bukan social login)
User Profile
User dapat melihat detail profil mereka.
User dapat memperbarui data personal, termasuk password dan juga foto profil.
Validasi terhadap foto yang diupload, ekstensi yang diperbolehkan hanya .jpg, .jpeg, .png dan .gif dan juga maksimum ukurannya adalah 1MB.
User dapat memperbarui email, tetapi wajib untuk diverifikasi ulang
User dapat memverifikasi ulang email, jika statusnya belum terverifikasi
User Address (10 Point)
User dapat menambah, mengupdate dan menghapus alamat mereka. Pada fitur ini student diminta untuk membuat :

Manage User Address
User dapat memiliki lebih dari satu alamat
User dapat menghapus dan memperbarui alamat yang sudah disimpan sebelumnya
User dapat mengatur sebuah alamat menjadi alamat utama pada aplikasi
Pickup Order, Order Tracking and Payment (35 Point)
Pada fitur ini, user dapat melakukan request untuk pickup laundry mereka. Disini user wajib untuk mengisi alamat penjemputan beserta jadwalnya. Selain itu user juga dapat memantau dan melunasi order mereka.

Pada fitur ini student akan diminta untuk membuat :

Create Pickup Order
User dapat melakukan request pickup baru berdasarkan alamat yang dipilih beserta jadwalnya
Proses pencarian outlet terdekat berdasarkan titik koordinat antara alamat user dan outlet-outlet yang tersedia
Ketika ada request pickup yang masuk ke salah satu outlet, maka driver pada outlet tersebut dapat mengambil order. Driver hanya dapat melakukan penjemputan atau pengantaran satu order dalam satu waktu.
Setelah pickup laundry telah sampai di outlet, maka admin outlet bertugas untuk melanjutkan pembuatan pesanan serta wajib melakukan input total kilo dan quantity tiap item yang akan di laundry
User dapat melakukan pembayaran ketika admin outlet telah memproses order tersebut. Batas akhir pembayaran user sampai dengan proses packing selesai. Apabila user tidak segera membayar hingga batas akhir yang sudah ditentukan, maka user akan mendapatkan notifikasi secara otomatis untuk segera menyelesaikan pembayarannya
Ketika proses pengerjaan telah selesai dan user telah melakukan pembayaran, maka secara otomatis akan muncul request pengantaran pada driver.
Order List
Customer dapat melihat daftar pesanan yang sedang berlangsung maupun yang sudah selesai (sesuai dengan status pesanan yang tersedia)
Customer dapat mencari pesanan berdasarkan tanggal dan no order/no invoice
Order Payment
Customer dapat melakukan pembayaran pada pesanan yang telah diproses.
Gunakan payment gateway untuk melunasi pembayaran.
Jika customer tidak melakukan pembayaran, maka pesanan tidak akan diantar.
Order Confirmation
Customer dapat konfirmasi order apabila laundry telah diterima
Order akan otomatis di konfirmasi ketika customer tidak mengubah statusnya selama 2 x 24 jam setelah laundry dikirimkan
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.
Feature 2
Admin Account Management (10 Point)
Untuk bisa masuk ke dalam admin dashboard, data user dengan role admin harus dibuat terlebih dahulu. Pada fitur ini student diminta untuk membuat :

Admin Authorization
Hanya user dengan role admin yang dapat masuk ke dalam admin dashboard
Manage User Data
Admin dapat melihat, membuat, memperbarui dan menghapus data user dengan role outlet admin, worker ataupun driver
Admin dapat melihat semua data user yang telah teregistrasi (bukan hanya admin)
Hanya admin yang bisa mengakses menu ini
Outlet Management (20 Point)
Admin dapat mengatur outlet, detail lokasi serta akses kepada outlet tersebut. Data outlet ini juga akan terhubung dengan data outlet admin, worker dan juga driver yang bekerja pada outlet tersebut. Pada fitur ini student diminta untuk membuat :

Outlet Management
Admin dapat melihat, membuat, memperbarui dan menghapus data outlet
Admin dapat menentukan titik lokasi outlet secara detail
Outlet admin tidak dapat mengakses fitur ini
Laundry Item Management
Admin dapat melihat, membuat, memperbarui dan menghapus laundry item seperti baju, celana panjang, celana pendek, celana dalam, dan lainnya
Assign Outlet Admin, Worker and Driver
Admin dapat menempatkan outlet admin, worker dan driver pada outlet tertentu
Outlet admin tidak dapat mengakses fitur ini
Order Management (40 Point)
Admin dapat melihat dan mengatur pesanan yang telah dibuat oleh user. Pada fitur ini student akan diminta untuk membuat:

Show All Order
Admin dapat melihat semua pesanan user untuk semua outlet, dan dapat memfilter pesanan berdasarkan outlet yang dipilih
Outlet admin hanya dapat melihat pesanan pada outlet masing masing
Pesanan dengan status dikirim nantinya akan menunggu konfirmasi dari user, baru kemudian pesanan dianggap selesai
Outlet admin dapat melakukan tracking terhadap order yang dibuat di outlet tersebut berdasarkan status ordernya, karyawan yang mengerjakan dan juga tanggal prosesnya
Create Orders
Outlet admin bertugas untuk memproses order berdasarkan pickup request
Pada saat create order, outlet admin wajib melakukan input total kilo dan juga quantity item tiap pakaian yang akan di laundry
Bypass Process
Untuk kasus item pakaian yang kurang, maka tiap worker wajib melakukan request access kepada outlet admin agar dapat melanjutkan proses pengerjaannya.
Outlet admin dapat menyetujui atau menolak request tersebut.
Jika request ditolak, maka worker wajib mengisi data hingga benar
Jika request disetujui, maka proses akan berlanjut ke station berikutnya
Report & Analysis (20 Point)
Sales Report
Admin dapat melihat laporan income untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
Outlet admin hanya dapat melihat laporan pada outlet masing masing
Laporan yang perlu disediakan :
Laporan income per hari / bulan / tahun
Employee Performance Report
Admin dapat melihat laporan performa karyawan untuk semua outlet, dan dapat memfilter data berdasarkan outlet dan tanggal
Outlet admin hanya dapat melihat laporan pada outlet masing masing
Laporan yang perlu disediakan :
Laporan total pekerjaan permasing karyawan (worker / driver)
Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Feature 3
Driver and Worker Attendance (20 Point)
Driver dan worker wajib untuk melakukan absensi setiap harinya sebelum bisa memproses pesanan. Pada fitur ini student diminta untuk membuat :
Submit Attendance
Menambahkan proses untuk absen datang dan pulang setiap harinya
Attendance Log
Driver dan worker dapat melihat history absensi mereka masing masing
Attendance Report
Admin outlet dapat melihat laporan absensi setiap karyawannya
Driver Management (20 Point)
Driver dapat mengambil request pickup yang dilakukan oleh user ataupun mengantarkan laundry yang sudah siap diantar. Pada fitur ini student akan diminta untuk membuat:

Pickup/Delivery Request List
Driver dapat menerima notifikasi apabila ada request pickup/delivery yang masuk
Driver dapat melihat daftar pesanan yang ada
Process Pickup/Delivery
Driver dapat memproses order yang ada
Driver hanya dapat memproses satu pesanan dalam satu waktu
Pickup/Delivery History
Driver dapat melihat history pickup and delivery
Worker Management (50 Point)
Worker dapat menerima notifikasi setiap ada laundry yang masuk ke station yang dihandle oleh worker.
Pada fitur ini student akan diminta untuk membuat:

Order List
Worker menerima notifikasi apabila ada laundry yang masuk ke station nya
Worker dapat melihat daftar pesanan yang ada
Processing Order
Worker dapat memproses pesanan yang masuk dan wajib input ulang item laundry apa saja yang akan dikerjakan
Jika yang diinput tidak sesuai, maka tidak dapat diproses
Jika yang diinput tidak sesuai, maka harus request untuk bypass kepada admin untuk dapat melanjutkan proses
Setelah proses input ulang item selesai, selanjutnya worker bisa menyelesaikan pesanan dan pesanan akan masuk ke station selanjutnya
Khusus untuk station packing, jika ternyata pesanan belum lunas maka status pesanan akan menjadi “Menunggu Pembayaran”. Tetapi jika sudah lunas maka status akan menjadi “Laundry Siap Diantar”
Show Job History
Worker dapat melihat history pekerjaan nya

Mentor Evaluation (10 Point)
Mentor akan menilai secara keseluruhan mulai dari proses development hingga hasil akhirnya. Detail penilaian akan dijelaskan dibawah.

Mentor Evaluation
Mentor memiliki hak untuk memberikan penilaian secara subjective terhadap hasil kerja student pada final project development. Bobot nilai dari mentor adalah 10 poin. Penilaiannya akan mencakup :

Kerapian tampilan UI
Komunikasi dengan anggota team
Inisiatif
Pengembangan fitur
References
Student dapat menggunakan tools di bawah ini untuk membantu menentukan lokasi dan menentukan harga pengiriman.
Dapat menggunakan API RajaOngkir atau free API lainnya untuk menentukan provinsi, kota dan kecamatan
Dapat menggunakan OpenCage atau free API lainnya untuk mendapatkan posisi geolocation berdasarkan provinsi dan kota
Standardization
Harap perhatikan poin poin dibawah ini, dan wajib untuk di implementasi. Akan ada pengecekan dan penilaian oleh juri untuk poin poin disini.
Validation
Semua input dari user harus divalidasi (client dan server)
Untuk input yang berupa file (bisa juga gambar), harus divalidasi extensionnya dan juga ukuran file yang bisa diterima
Semua proses yang krusial, harus ada approval dari user terlebih dahulu sebelum di proses (misalkan hapus data tertentu)
Pagination, Filtering and Sorting
Semua tampilan dalam bentuk list (misalnya product list, order list atau user list) harus menggunakan pagination, filter dan sort. Semuanya diproses di server (tidak diperbolehkan untuk diproses di client)
Frontend
Wajib responsive minimal ukuran mobile dan web
Design yang digunakan dapat dimengerti oleh penguji maupun user umum yang akan menggunakan web app tersebut
Tampilan dibuat semenarik mungkin, bukan sesederhana nya
Penamaan file harus jelas, merepresentasikan kegunaannya
Perhatikan penggunaan ekstensi file (jsx di gunakan ketika ada unsur html di dalam js)
Title dan favicon disesuaikan dengan project yang dikerjakan
Backend
Penggunaan method rest api yang sesuai dengan kaidah nya merujuk ke sini
Terapkan authorization pada api yang hanya bisa diakses oleh user tertentu
Clean Code
Dalam setiap file, maksimal baris code adalah 200 baris. Jika lebih harus di-refactor terlebih dahulu
Penggunaan log yang tidak terpakai harus dibersihkan sebelum masuk ke production
Penggunaan code yang tidak terpakai harus dibersihkan
Penulisan function maksimal 15 baris, jika lebih harus di re-factor
