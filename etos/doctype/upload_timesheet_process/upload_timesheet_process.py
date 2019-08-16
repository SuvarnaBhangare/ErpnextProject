# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils.csvutils import read_csv_content_from_uploaded_file
from datetime import datetime, timedelta
import json


class UploadTimesheetProcess(Document):

	def validate_rec(self):
		if not self.project:
			frappe.throw(_("Project is Not Specified"))

		if not self.attendance_date:
			frappe.throw(_("Attendance Date is Not Specified"))

	# Triggered of button validate
	def validate_attend_rcd(self,data=None):
		# data_status=[]
		self.validate_rec()

		list_emp = []
		if data:
			for row in data:
				result= result_aft_val(row,self.attendance_date, self.project)

				list_emp.append({'employee_id':row['employee_id'],'violation_status':violation_str(result['violation_status']),'ot_hr':result['ot_hr'],'total_working':result['total_working'],'status':result['status'],'leave_type':result['leave_type'],'violation_class':result['violation_class']})
		
		return list_emp
	
	
	def insert_record_in_table(self,data):
		self.validate_rec()
		if data:
			for row in data:
				self.create_attedance_violation(row)
				self.create_attendance(row)
		return 'Updated'

	def create_attedance_violation(self,row):
		att_v_doc = frappe.new_doc("Attendance_Violation Process Data")
		att_v_doc.employee_id = row['employee_id']
		att_v_doc.task = row['task']
		att_v_doc.division = row['division']
		att_v_doc.project = self.project
		att_v_doc.shift_type = row['shift_type']
		att_v_doc.bill_rate = row['bill_rate']
		att_v_doc.ot_hours = row['ot_hours']
		att_v_doc.total_working_hours = row['total_working']
		att_v_doc.in_date = row['in_date'] if row['in_date'] else None
		att_v_doc.in_time = row['in_time'] if row['in_time'] else None
		att_v_doc.out_date = row['out_date'] if row['out_date'] else None
		att_v_doc.out_time = row['out_time'] if row['out_time'] else None
		att_v_doc.actual_in_date = row['actual_in_date'] if row['actual_in_date'] else None
		att_v_doc.actual_in_time = row['actual_in_time'] if row['actual_in_time'] else None
		att_v_doc.actual_out_date = row['actual_out_date'] if row['actual_out_date'] else None
		att_v_doc.actual_out_time = row['actual_out_time'] if row['actual_out_time'] else None
		att_v_doc.violations = row['violations']
		att_v_doc.status = row['status']

		att_v_doc.insert(ignore_permissions=True)
		att_v_doc.save()

	def create_attendance(self,row):
		att_doc = frappe.new_doc("Attendance")
		att_doc.employee = row['employee_id']
		att_doc.status = row['status']
		att_doc.attendance_date = self.attendance_date
		att_doc.leave_type = row['leave_type']
		att_doc.ot_hours = row['ot_hours']
		att_doc.total_working_hours=row['total_working']
		att_doc.in_time = row['in_time'] if row['in_time'] else None
		att_doc.out_time = row['out_time'] if row['out_time'] else None
		att_doc.insert(ignore_permissions=True)
		att_doc.save()
		att_doc.submit()

def result_aft_val(row,attendance_date=None,project=None):
	abbr=emp_abbr=att_abbr=punch_abbr=shift_abbr=''
	task_val=att_val=punch_val=shift_val=week_off=''
	result=task_list=status=leave_type=special_shift=employee_name=None
	total_working=ot_hr='00:00:00'
	emp_weekly_off=[]

	emp_result,employee_val,emp_abbr = employee_detail_validate(row['employee_id'],attendance_date)
	abbr += emp_abbr

	if not emp_result:
		employee_name = employee_val[0]['employee_name']
		
		att_val,att_abbr = attendance_mark(row['employee_id'],attendance_date)
		abbr += att_abbr
		
		if not att_val:
			if row['in_date']:
				task_val=employee_task_validate(project,row['employee_id'],row['in_date'])
				task_list= task_val['sql_task']
				abbr += task_val['abbr']
				task_val= task_val['result']

				if employee_val[0]['weekly_off_day1']:
					emp_weekly_off.append((employee_val[0]['weekly_off_day1']).lower())
				if employee_val[0]['weekly_off_day2']:
					emp_weekly_off.append((employee_val[0]['weekly_off_day2']).lower())
				
				if len(emp_weekly_off)>0:
					attendance_day = datetime.strptime(attendance_date,'%Y-%m-%d')
					attendance_day = datetime.strftime(attendance_day,'%A')
					if attendance_day.lower() in list(emp_weekly_off):
						special_shift='special'
						week_off += '<span class="indicator red list-group-item">Weekly Off</span>'
						abbr += ' weekly_off'
				
				leave_abs=on_leav_or_absent(row['employee_id'],attendance_date)
				leave_type=leave_abs['leave_type']

				punch_val,punch_abbr = single_punch(row['in_date'],row['in_time'],row['out_date'],row['out_time'])
				abbr += punch_abbr
				
				if not task_val and not punch_val:
					shift_val,shift_abbr = shift_type_validate(task_list[0]['shift_name'],row['in_date'],row['in_time'],row['out_date'],row['out_time'])
					abbr += shift_abbr

					ot_hr,total_working=cal_ot_hr( None if special_shift else task_list[0]['shift_name'],row['in_date'],row['in_time'],row['out_date'],row['out_time'],'Present')
			else:
				leave_abs = on_leav_or_absent(row['employee_id'],attendance_date)
				status = leave_abs['status']
				leave_type = leave_abs['leave_type']

	result = emp_result+task_val+punch_val+shift_val+att_val+week_off

	if not result and row['in_date'] and not status:
		status='Present'

	return ({'employee_name':employee_name,'special_shift':special_shift,'task':task_list,'violation_status':result,'ot_hr':ot_hr,'total_working':total_working,'status':status,'leave_type':leave_type,'violation_class':abbr})


@frappe.whitelist()
def date_diff_val(in_date=None,in_time=None,out_date=None,out_time=None,status=None):
	result=''
	if in_date and in_time and out_date and out_time:
		indatetime=in_date+" "+in_time
		def_emp_start=indatetime=datetime.strptime(indatetime,'%Y-%m-%d %H:%M:%S')

		outdatetime=out_date+" "+out_time
		def_emp_end=outdatetime=datetime.strptime(outdatetime,'%Y-%m-%d %H:%M:%S')
		if def_emp_end < def_emp_start:
			result+='<span class="indicator red list-group-item">IN Time cannot be Greater then OUT Time</span>'

	return result

def get_duration(duration):
    hours = int(duration / 3600)
    minutes = int(duration % 3600 / 60)
    seconds = int((duration % 3600) % 60)
    return '{:02d}:{:02d}:{:02d}'.format(hours, minutes, seconds)

@frappe.whitelist()
def cal_ot_hr(shift_type=None,in_date=None,in_time="00:00:00",out_date=None,out_time="00:00:00",status=None):
	total_ot="00:00:00"
	total_working="00:00:00"
	if status=="Present":
		if in_date and in_time and out_date and out_time:
			start_time=end_time=break_time=total_hours=ot_hours=total_ot=min_ot_limit="00:00:00"
			if shift_type:
				shift_time=frappe.get_doc("Shift Type",shift_type)
				if shift_time:
					start_time = str(shift_time.start_time)
					end_time = str(shift_time.end_time)
					min_ot_limit = str(shift_time.minimum_ot_limit) if shift_time.minimum_ot_limit else "00:00:00"
					# break_time=str(shift_time.break_time)
					# ot_hours=str(shift_time.ot_hrs)
					total_hours = str(frappe.utils.data.time_diff(end_time,start_time))
					# minimum_ot_limit=str(shift_time.minimum_ot_limit)
					# ot_slab_in_minutes=str(shift_time.ot_slab_in_minutes)
				else:
					start_time=end_time=break_time=total_hours=min_ot_limit="00:00:00"

				indatetime=in_date+" "+in_time
				def_emp_start=indatetime=datetime.strptime(indatetime,'%Y-%m-%d %H:%M:%S')

				outdatetime=out_date+" "+out_time
				def_emp_end=outdatetime=datetime.strptime(outdatetime,'%Y-%m-%d %H:%M:%S')

				def_total_work_hr=outdatetime-indatetime
			
				start_time=in_date+" "+start_time
				total_hours=datetime.strptime(total_hours,'%H:%M:%S')

				end_time=datetime.strptime(start_time,'%Y-%m-%d %H:%M:%S')+timedelta(hours=total_hours.hour,minutes=total_hours.minute,seconds=total_hours.second)
				end_time=str(end_time)

				default_ot=datetime.strptime(ot_hours,'%H:%M:%S')

				total_hours=str(total_hours)
				total_hours=frappe.utils.data.to_timedelta(total_hours)
				break_time=frappe.utils.data.to_timedelta(break_time)

			
				def_total_work_hr = def_emp_end - def_emp_start
			
				standard_work_hr=total_hours-break_time-timedelta(hours=default_ot.hour,minutes=default_ot.minute,seconds=default_ot.second)
			
				# minimum_ot_limit=frappe.utils.data.to_timedelta(minimum_ot_limit)
				# ot_slab_in_minutes=frappe.utils.data.to_timedelta(ot_slab_in_minutes)
				if def_total_work_hr > standard_work_hr:
					total_ot = def_total_work_hr-standard_work_hr-break_time
				else:
					total_ot = frappe.utils.data.to_timedelta("00:00:00")
				
				if frappe.utils.data.to_timedelta(min_ot_limit) > total_ot:
					total_ot = frappe.utils.data.to_timedelta("00:00:00")

				total_working=def_total_work_hr
			else:
				total_ot="00:00:00"
	
				indatetime=in_date+" "+in_time
				def_emp_start=indatetime=datetime.strptime(indatetime,'%Y-%m-%d %H:%M:%S')

				outdatetime=out_date+" "+out_time
				def_emp_end=outdatetime=datetime.strptime(outdatetime,'%Y-%m-%d %H:%M:%S')

				total_ot=def_emp_end-def_emp_start
				total_working=total_ot

			if total_ot:
				total_ot=get_duration(total_ot.total_seconds())
				total_working=get_duration(total_working.total_seconds())


	if str(total_ot)[1]==":":
		total_ot="0"+str(total_ot)

	return total_ot,total_working

def employee_detail_validate(employee_id,attendance_date):
	result=employee=abbr=''
	if employee_id:
		employee=frappe.db.get_values("Employee", {'name': employee_id}, "*", as_dict=True)
		if not employee:
			result += '<span class="indicator red list-group-item">Employee ID didn\'t Matched</span>'
			abbr += ' profile_violation'
		else:
			date_of_joining = frappe.utils.data.getdate(str(employee[0]['date_of_joining']))
			validate_date = frappe.utils.data.getdate(str(attendance_date))
			if validate_date < date_of_joining:
				result += '<span class="indicator red list-group-item">Attendance Date cannot be less then Employee Joining Date</span>'
				abbr += ' stop_attendance'
	
	return result,employee,abbr


def employee_task_validate(project,employee_id,attendance_date):
	result=abbr=''
	sql_task = "SELECT `emp_all`.`task`,`emp_all`.`division`,`emp_all`.`bill_rate` ,`emp_all`.`shift_name` FROM `tabUpload Mobilization Data` as `emp_all`,`tabUpload Mobilization` as `emp_up_all` WHERE `emp_up_all`.`docstatus`=1 and `emp_up_all`.name=`emp_all`.`parent` AND `emp_up_all`.`project`= '{0}' AND `emp_all`.employee='{1}' AND '{2}' between `emp_all`.`start_date` and `emp_all`.`end_date` ".format(project,employee_id,attendance_date)
	sql_task = frappe.db.sql(sql_task,as_dict=True)
	if not sql_task:
		result = '<span class="indicator red list-group-item">Employee Project didn\'t Matched</span>'
		abbr = ' project_violation'
	return ({'sql_task':sql_task,'result':result,'abbr':abbr})

def single_punch(in_date,in_time,out_date,out_time):
    result=abbr=''

    if not in_date or not in_time:
        result += '<span class="indicator red list-group-item">Single Punch</span>'
    if not out_date or not out_time:
        result += '<span class="indicator red list-group-item">Single Punch</span>'

    if result:
        abbr = ' single_punch'

    return result,abbr

def shift_type_validate(shift_type,in_date,in_time,out_date,out_time):
	result=abbr=''
	if shift_type:
		shift_type=frappe.get_doc("Shift Type",shift_type)
		start_time=total_hours='00:00:00'
		if shift_type:
			start_time=str(shift_type.start_time)
			end_time=str(shift_type.end_time)
			total_hours=frappe.utils.data.time_diff(end_time,start_time)

			shift_start_time=in_date+" "+start_time
			shift_start_time=datetime.strptime(shift_start_time,"%Y-%m-%d %H:%M:%S")

			shift_end_time=shift_start_time+total_hours
			
			in_date_time=in_date+" "+in_time
			in_date_time=datetime.strptime(in_date_time,"%Y-%m-%d %H:%M:%S")

			out_date_time=out_date+" "+out_time
			out_date_time=datetime.strptime(out_date_time,"%Y-%m-%d %H:%M:%S")

			if shift_start_time<in_date_time:
				result+='<span class="indicator red list-group-item">Late Coming</span>'
				abbr += ' late_coming'
			
			if shift_end_time>out_date_time:
				result+='<span class="indicator red list-group-item">Early Going</span>'
				abbr += ' early_going'
	
	return result, abbr

def attendance_mark(employee,attendance_date):
    result=abbr = ''
    att_sql = "SELECT * FROM `tabAttendance`  WHERE employee='{0}'  AND attendance_date='{1}'".format(employee,attendance_date)
    att_sql = frappe.db.sql(att_sql,as_dict=True)

    if att_sql:
        result = '<span class="indicator red list-group-item">Attendance already Marked</span>'
        abbr = ' attendance_violation'

    return result,abbr

def on_leav_or_absent(employee_id,attendance_date):
	status=leave_type=''
	leav_sql = "SELECT leave_type FROM `tabLeave Application` WHERE `docstatus`=1 AND `status`='Approved' AND '{0}' between `from_date` and `to_date` AND `employee`='{1}'".format(attendance_date,employee_id)
	leav_sql = frappe.db.sql(leav_sql,as_dict=True)
	if leav_sql:
		leave_type = leav_sql[0]['leave_type']
		status = 'On Leave'
	else:
		status = 'Absent'

	return {'leave_type':leave_type,'status':status}

columns=['','Employee ID','IN Time','OUT Time']

@frappe.whitelist()
def upload():

	file_name=frappe.form_dict.filename
	file_type=file_name.split('.')[-1]
	if not file_type == 'csv':
		frappe.msgprint(_("Document with extension CSV can only be uploaded"))
		return
	
	args=frappe.form_dict.args
	args=json.loads(args)
	
	if not args['date'] or not args['project']:
		frappe.msgprint(_("Please Fill the Mandatory Fields"))
		return
	
	if frappe.utils.data.getdate(args['date']) > frappe.utils.data.getdate():
		frappe.msgprint(_("Attendance can not be marked for future dates"))
		return
	
	attendance_date=datetime.strptime(args['date'],"%Y-%m-%d")
	attendance_date=datetime.strftime(attendance_date,'%Y-%m-%d')

	data = read_csv_content_from_uploaded_file()

	error_list=''
	date_mis_match=''
	rows=[]
	if data:
		for i in range(3,len(data)):
			if i==3:
				if not len(data[i]) == len(columns):
					frappe.msgprint(_("Please Upload Standard Template"))
					return

				if data[i][1] != columns[1] or data[i][2] != columns[2] or data[i][3] != columns[3]:
					frappe.msgprint("Please Do not Change Column Name in Template")
					return
			else:
				in_date=in_time=out_date=out_time=''
				
				if data[i][1]:
					if data[i][2]:
						try:
							in_time_og=datetime.strptime (data[i][2],"%Y-%m-%d %H:%M:%S")
							in_date=datetime.strftime(in_time_og,'%Y-%m-%d')
							in_time=datetime.strftime(in_time_og,'%H:%M:%S')
						except ValueError:
							error_list += '<span class="indicator red list-group-item">Incorrect IN data format, should be YYYY-MM-DD HH:MM:SS at Row Index '+str(i)+'</span>'
							
					if not in_date or in_date==attendance_date:
						
						if data[i][3]:
							try:
								out_time_og=datetime.strptime (data[i][3],"%Y-%m-%d %H:%M:%S")
								out_date=datetime.strftime(out_time_og,'%Y-%m-%d')
								out_time=datetime.strftime(out_time_og,'%H:%M:%S')
							except ValueError:
								error_list += '<span class="indicator red list-group-item">Incorrect OUT data format, should be YYYY-MM-DD HH:MM:SS at Row Index '+str(i)+'</span>'
								
						date_diff_result=date_diff_val(in_date,in_time,out_date,out_time)
						if date_diff_result:
							error_list += date_diff_result
										
						result= result_aft_val(({'employee_id':data[i][1],'in_date':in_date,'in_time':in_time,'out_date':out_date,'out_time':out_time}),attendance_date, args['project'])

						rows.append({'employee_id':data[i][1],'employee_name':result['employee_name'],'division':result['task'][0]['division'] if result['task'] else None ,'task':result['task'][0]['task'] if result['task'] else None,'bill_rate':result['task'][0]['bill_rate'] if result['task'] else None,'in_date':in_date,'in_time':in_time,'out_date':out_date,'out_time':out_time,'shift_type':result['task'][0]['shift_name'] if result['task'] else None,'special_shift':result['special_shift'], 'status':result['status'],'violation_status':violation_str(result['violation_status']),'leave_type':result['leave_type'],'ot_hr':result['ot_hr'],'total_working':result['total_working'],'violation_class':result['violation_class']})
		if error_list:
			frappe.msgprint(str(violation_str(error_list)))
			return

	rows.sort(key=None,reverse=True)
	return rows

def violation_str(violation):
	if violation:
		return "<div class=\"list-group\">"+violation+"</div>"
	else:
		return None


from frappe.utils.csvutils import UnicodeWriter
from frappe.utils import cstr

@frappe.whitelist()
def get_template():
	if not frappe.has_permission("Upload Timesheet Process", "create"):
		raise frappe.PermissionError

	w = UnicodeWriter()
	w = add_header(w)

	frappe.response['result'] = cstr(w.getvalue())
	frappe.response['type'] = 'csv'
	frappe.response['doctype'] = "Upload Timesheet Process"


def add_header(w):

	w.writerow(["Notes:"])
	w.writerow(["Please do not change the template headings"])
	w.writerow(["","","YYYY-MM-DD HH:MM:SS","YYYY-MM-DD HH:MM:SS",""])
	w.writerow(columns)
	return w