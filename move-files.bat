set main_homework="C:\hw-assist\homework"
set new_homework="C:\hw-assist\all_homeworks"
set old_homework="C:\hw-assist\old_homeworks"

if not exist %old_homework% (
	echo folder does not exists. creating...
	md %old_homework%
    )

cd /d %main_homework%
for /r %%d in (*) do move "%%d" %old_homework%