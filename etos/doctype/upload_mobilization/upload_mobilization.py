# -*- coding: utf-8 -*-
# Copyright (c) 2018, tbtech and contributors
# For license information, please see license.txt


from __future__ import unicode_literals
import frappe
from frappe.utils import cstr, add_days, date_diff
from frappe import _
from frappe.utils.csvutils import UnicodeWriter
from frappe.model.document import Document
from frappe.utils.csvutils import read_csv_content_from_uploaded_file
from frappe.modules import scrub
from frappe.utils.csvutils import check_record, import_doc
import json 
import time
import datetime
import ast

class UploadMobilization(Document):
	def on_cancel(self):
		self.flags.ignore_validate=True
		self.update_status('Standby')
		
	def on_submit(self):
		self.flags.ignore_validate=True
		self.update_status('Mobilized')
	
	#update status of employee
	def update_status(self,status):
		if self.mobilization =="Employee":
			for emp in self.get('upload_employee_project_allocation_data'):
				employee = emp.employee
				# frappe.client.set_value("Employee", employee , {'project_status': status})
				doc = frappe.get_doc("Employee",employee)
				doc.project_name = self.project
				if doc.project_name:
					doc.project_status = status
				doc.save()
		
				frappe.db.commit()
		else:
			for asset in self.get('mobilization_asset'):
				asset = asset.asset_id
				doc = frappe.get_doc("Asset",asset)
				doc.asset_status = status
				doc.save()
				

	#duplicate task and shift	
	# def sql_for_task(self,emp,select_field):
	# 	sql = "select {3} from `tabUpload Mobilization Data` where ('{0}' between start_date and end_date or '{1}' between start_date and end_date) and  employee='{2}' and docstatus=1 ".format(emp.start_date,emp.end_date,emp.employee,select_field)
	# 	frappe.msgprint(str(sql))
	# 	return frappe.db.sql(sql,as_list=1)


	def validate(self):
		error_list=[]
		temp_asset_list=[]
		if self.mobilization=="Employee":
			employee = "select employee from tabEmployee where project_status ='Mobilized'"
			# frappe.throw(str(employee))
			employee_list=frappe.db.sql(employee,as_list=1)
			# frappe.msgprint(employee_list)
			
			temp_emp_list = []
			
			for emp in self.get('upload_employee_project_allocation_data'):
				if emp.employee in str(temp_emp_list):
					error_list.append("Duplicate Entry of Employee <b>"  +str(emp.employee)+ "</b> in Row <b>" +str(emp.idx)+"</b>")
		

				elif emp.employee in str(employee_list):
					error_list.append("<html> Employee <b>"+str(emp.employee)+"</b> Already Mobilized in Row <b> "+str(emp.idx)+"</b>")
					# frappe.throw("jii")
				
						
				else:
					#duplicate task and shift
					select_fields = "shift_name"
					shift_sql = "select {3} from `tabUpload Mobilization Data` where ('{0}' between start_date and end_date or '{1}' between start_date and end_date) and  employee='{2}' and docstatus=1 ".format(emp.start_date,emp.end_date,emp.employee,select_fields)
					# frappe.msgprint(str(sql))
					shift_data=frappe.db.sql(shift_sql,as_dict=1)
					# frappe.msgprint(shift_and_task_data['task'])
					if shift_data:
						error_list.append("<html>Shift Date Already Exist of Employee <b>'"+emp.employee+"'</b> in Row <b>"+str(emp.idx)+"</b></html>"  )
						
					task_sql = "select task from `tabUpload Mobilization Data` where ('{0}' between start_date and end_date or '{1}' between start_date and end_date) and  employee='{2}' and docstatus=1 ".format(emp.start_date,emp.end_date,emp.employee)
					# frappe.msgprint(str(sql))
					task_data=frappe.db.sql(task_sql,as_dict=1)
					# frappe.msgprint(shift_and_task_data['task'])
					if task_data:
						error_list.append("<html>Task Already Exist of Employee <b>'"+emp.employee+"'</b> in Row <b>"+str(emp.idx)+"</b></html>"  )
						
					
					
					# task_overlap = self.sql_for_task(emp,'task')
					# task_overlap=list(ast.literal_eval(str(sum(list(task_overlap),[]))))
					# task_overlap = self.sql_for_task(emp,'task')
					# task_overlap=list(ast.literal_eval(str(sum(list(task_overlap),[]))))
					# frappe.msgprint(str(len(task_overlap)))
					# frappe.msgprint(str(len(list(set(task_overlap)))))

					# if len(task_overlap)>len(list(set(task_overlap))):
					# 	frappe.throw("hii")
					# 	error_list.append("<html><b>Task</b> Already Allocated To Employee <b>'"+emp.employee+"'</b> in Row <b>"+str(emp.idx)+"</b></html>" )	
					# if len(task_overlap)>len(list(set(task_overlap))):
					# 	error_list.append("<html>Task Already Exits of Employee <b>'"+emp.employee+"'</b> in Row <b>"+str(emp.idx)+"</b></html>"  )
							
					# shift_overlap = self.sql_for_task(emp,'shift_name')
					
					# shift_overlap=list(ast.literal_eval(str(sum(list(shift_overlap),[]))))
					# # frappe.msgprint(str(len(shift_overlap)))
					# # frappe.msgprint(str(len(list(set(shift_overlap)))))
					

					# if len(shift_overlap)>len(list(set(shift_overlap))):
					# 	error_list.append("<html>Shift Date Already Exits of Employee <b>'"+emp.employee+"'</b> in Row <b>"+str(emp.idx)+"</b></html>"  )
					
					
						
					if emp.start_date > emp.end_date:
						error_list.append("<html><b>Start Date</b> should be less than <b>End Date</b> in Row <b> "+str(emp.idx)+"")

					if emp.employment_type in ('PO Rate','Hourly') and emp.bill_rate is None :
						error_list.append("<html> <b>Bill Rate</b>  is Required For <b>Employment Type</b> <b>PO Rate </b> And <b>Hourly</b>  in Row <b> "+str(emp.idx)+"")
					if emp.employment_type in ('PO Rate','Hourly') and emp.bill_rate==0:
						error_list.append("<html> <b>Bill Rate</b>  Should Be Greater Than 0 For <b>Employment Type</b> <b>PO Rate </b> And <b>Hourly</b>  in Row <b> "+str(emp.idx)+"")
					
					
					sql = "select parent from `tabProject Task` where task_id = '{0}' ".format(emp.task)
					data = frappe.db.sql(sql,as_list=1)
					
					if self.project not in str(data):
						error_list.append("<html>Task<b>'"+emp.task+"'</b> Is Not Match with Project Name <b>'"+self.project+"'</b> in Row <b>"+str(emp.idx)+"</b></html>")
						# data=data[0]
							
						# if data['parent'] !=self.project:
								

				temp_emp_list.append(emp.employee)	
						
		if error_list:
			for n in error_list:
				frappe.msgprint(_(n))
			frappe.throw("")
		else:
			for asset in self.get('mobilization_asset'):
				
				asset_id=asset.asset_id
				idx = asset.idx
				
				mobilization_start_date = asset.mobilization_start_date
				mobilization_end_date = asset.mobilization_end_date
				asset = "select name from tabAsset where asset_status ='Mobilized' "
				asset_list=frappe.db.sql(asset,as_list=1)
				
					
				if asset_id in str(temp_asset_list):
					error_list.append("Duplicate Entry of Asset <b>"  +str(asset_id)+ "</b> in Row <b>" +str(idx)+"</b>")
				elif asset_id in str(asset_list):
					error_list.append("<html>  <b>"+str(asset_id)+"</b> Already Mobilized in Row <b> "+str(idx)+"</b>")
	
					#duplicate asset		
					asset_sql="select asset_id from `tabAsset Mobilization ` where ('{0}' between mobilization_start_date and mobilization_end_date or '{1}' between mobilization_start_date and mobilization_end_date) and  asset_id='{2}' and docstatus=1 ".format(mobilization_start_date,mobilization_end_date,asset_id)
					asset_data= frappe.db.sql(asset_sql,as_list=1)
					if asset_data:
						error_list.append("<html>Asset<b>'"+str(asset_id)+"'</b>  Already Mobilized To EmployeIn Exsting Date in Row <b>"+str(idx)+"</b></html>")	

					
				else:	
					if mobilization_start_date > mobilization_end_date:
						error_list.append("<html><b>Mobilization Start Date</b> Should Be Less Than <b>Mobilization End Date </b> "+str(idx)+"</b>")

					
							


				temp_asset_list.append(asset_id)
		
		if error_list:
			for n in error_list:
				frappe.msgprint(_(n))
			frappe.throw("")		
	pass

#for upload excel data
@frappe.whitelist()
def upload():
	# frappe.throw(str(mobilize_catg))
	
	file_name=frappe.form_dict.filename
	file_type=file_name.split('.')[-1]
	if not file_type == 'csv':
		frappe.msgprint(_("Document with extension CSV can only be uploaded"))
		return
	args=frappe.form_dict.args	
	args=json.loads(args)
	# frappe.throw(str(args['mobilize_category']))	
	error_list=[]
	data_list=[]
	rows = read_csv_content_from_uploaded_file()
	columns = ["Employee ID", "Employee Name", "Employment Type", "Division", "Task ID", "Start Date", "End Date","Shift Type", "Bill Rate"]
	asset_columns = ["Project","Asset Id","Asset Name", "Mobilization Start Date", "Mobilization End Date","Daily Cost","Daily Rate"]

	
	if args['mobilize_category']=="Employee":
		for i in range(3, len(rows)):
			# employee = rows[i][0]
			# employee_name = rows[i][1]
			# division = rows[i][3]
			if i==3:
				# if not len(rows[i]) == len(columns):
				# 	frappe.msgprint(_("Please Upload Standerd Template"))
				# 	return

				if rows[i][0]!=columns[0] or rows[i][1]!=columns[1] or rows[i][2]!=columns[2] or rows[i][3]!=columns[3] or rows[i][4]!=columns[4] or rows[i][5]!=columns[5] or rows[i][6]!=columns[6]or rows[i][7]!=columns[7]or rows[i][8]!=columns[8] :
					frappe.msgprint("Please Do Not Change Column Name In Template")
					return
			else:	

				
				
				if rows[i][5] is None:
					error_list.append("<html> Start Date is Required in Row <b> "+str(i+1)+"")	

				
				if rows[i][6] is None:
					error_list.append("<html> End Date is Required in Row <b> "+str(i+1)+"")	

				if rows[i][5] is not None:
					try:
						datetime.datetime.strptime(rows[i][5], "%Y-%m-%d")
					except ValueError:
						error_list.append("<html>Incorrect Mobilization End Date Format.. It Shoud Be in <b>YYYY-MM-DD</b> in row "+str(i+1)+"<html> ")

				
				if rows[i][6] is not None:
					try:
						datetime.datetime.strptime(rows[i][6], "%Y-%m-%d")
					except ValueError:
						error_list.append("<html>Incorrect Mobilization End Date Format.. It Shoud Be in <b>YYYY-MM-DD</b> in row "+str(i+1)+"<html> ")	

				if 	rows[i][5]>rows[i][6]:
					error_list.append("<html> <html><b>Start Date</b> should be less than <b>End Date</b> in Row <b> "+str(i+1)+"")		
				
				if rows[i][0] is None:
					error_list.append("<html> Employee ID is Required in Row <b> "+str(i+1)+"")
				
				task = rows[i][4]
				if task is None and rows[i][4]:
					error_list.append("<html> Task is Required in Row <b> "+str(i+1)+"")

				
				

				shift_name = rows[i][7]	
				if shift_name is None:
					error_list.append("<html> Shift Type is Required in Row <b> "+str(i+1)+"")
				
				if shift_name is not None:
					sql = "SELECT name  FROM `tabShift Type` where name = '{0}' ".format(rows[i][7])
					data = frappe.db.sql(sql,as_dict=1)
					if not data:
						error_list.append("<html> Existing Shift Type Does Not Matched With System Shift Type</b> For Employee  <b> "+str(rows[i][0])+"</b> In  <b> Row " +str(i+1)+"</b>")

				employment_type = rows[i][2]
				bill_rate = rows[i][8]
				if employment_type in ('PO Rate','Hourly') and bill_rate is None :
					error_list.append("<html> <b>Bill Rate</b>  is Required For <b>Employment Type</b> PO Rate </b> And <b> Hourly</b>  in Row <b>  "+str(i+1)+"</b>")

				data_list.append({'employee':rows[i][0],'employee_name':rows[i][1],'start_date':rows[i][5],'end_date':rows[i][6],'task':task,'shift_name':shift_name,'employment_type':employment_type,'bill_rate':bill_rate,'division':rows[i][3]})
		if error_list:
			for n in error_list:
				frappe.msgprint(_(n))
				
			return				

	else:

		for i in range(3, len(rows)):
			if i==3:
				# if not len(rows[i]) == len(asset_columns):
				# 	frappe.msgprint(_("Please Upload Standerd Template"))
				# 	return
				# frappe.throw(str(rows[i][6]))
				if rows[i][0]!=asset_columns[0] or rows[i][1]!=asset_columns[1] or rows[i][2]!=asset_columns[2] or rows[i][3]!=asset_columns[3] or rows[i][4]!=asset_columns[4] or rows[i][5]!=asset_columns[5] or rows[i][6]!=asset_columns[6] :
					frappe.msgprint("Please Do Not Change Column Name In Template")
					return
			else:

				if rows[i][1] is None:
					error_list.append("<html> Asset ID is Required in Row <b> "+str(i+1)+"</b></html>")
				if 	rows[i][1] is not None:
					asset_equiptment = "select is_equipment FROM tabAsset where name='{0}'".format(rows[i][1])
					# frappe.throw(str(asset_equiptment))
					asset_equiptment_data = frappe.db.sql(asset_equiptment,as_dict=1)
					# frappe.throw(str(asset_equiptment_data[0]))
					if asset_equiptment_data:
						# frappe.throw(str(asset_equiptment_data))
						is_equipment = asset_equiptment_data[0]
						# frappe.throw(str(is_equipment))
						if is_equipment['is_equipment']==0:
							error_list.append("<html> Exitsing Asset Name Is Not Equiptment in Row <b> "+str(i+1)+"</b>  </html>")

				asset_name = rows[i][2]
				if asset_name is None:
					error_list.append("<html> Asset Name is Required in Row <b> "+str(i+1)+"</b></html>")
				start_date = rows[i][3]
				if start_date is None:
					error_list.append("<html> Mobilization Start Date is Required in Row <b> "+str(i+1)+"</b></html>")

				if start_date is not None:
					try:
						datetime.datetime.strptime(start_date, "%Y-%m-%d")
					except ValueError:
						error_list.append("<html>Incorrect Mobilization Start Date Format.. It Shoud Be in <b>YYYY-MM-DD</b> in row "+str(i+1)+"<html> ")	
				
				end_date =rows[i][4]
				if start_date is None:
					error_list.append("<html> Mobilization End  Date is Required in Row <b> "+str(i+1)+"")	

				if end_date is not None:
					try:
						datetime.datetime.strptime(end_date, "%Y-%m-%d")
					except ValueError:
						error_list.append("<html>Incorrect Mobilization End Date Format.. It Shoud Be in <b>YYYY-MM-DD</b> in row "+str(i+1)+"<html> ")	


						

				
				data_list.append({"asset_id":rows[i][1] ,"asset_name":asset_name,"mobilization_start_date":start_date,"mobilization_end_date":end_date,"daily_cost":rows[i][5],"daily_rate":rows[i][6]})
		
		if error_list:
			for n in error_list:
				frappe.msgprint(_(n))
				
			return		
	return data_list


@frappe.whitelist()
def get_template(mobilization):
	# frappe.throw(str(mobilization))
	args = frappe.local.form_dict
	
	if mobilization== "Employee":
		
		if args["company"]==',':
			args["company"]=json.dumps(None)
		else:
			args["company"]="'"+args["company"]+"'"

		if args["branch"]==',':
			args["branch"]=json.dumps(None)
		else:
			args["branch"]="'"+args["branch"]+"'"	


		if args["division"]==',':
			args["division"]=json.dumps(None)
		else:
			args["division"]="'"+args["division"]+"'"	

		if args["department"]==',':
			args["department"]=json.dumps(None)
		else:
			args["department"]="'"+args["department"]+"'"	

		if args["designation"]==',':
			args["designation"]=json.dumps(None)
		else:
			args["designation"]="'"+args["designation"]+"'"				

		
		w = UnicodeWriter()
		w = add_header(w, args)

		w = add_data(w, args)	
							
	else:
		# frappe.msgprint("emp")
		if args["company"]==',':
			args["company"]=json.dumps(None)
		else:
			args["company"]="'"+args["company"]+"'"

		if args["department"]==',':
			args["department"]=json.dumps(None)
		else:
			args["department"]="'"+args["department"]+"'"
		w = UnicodeWriter()	
		w = add_header_for_asset(w, args)
		w = add_data_asset(w, args)	
		
	# write out response as a type csv
	frappe.response['result'] = cstr(w.getvalue())
	frappe.response['type'] = 'csv'
	frappe.response['doctype'] = "Upload Mobilization"

def add_header(w, args):
	
	w.writerow(["Notes:"])
	w.writerow(["Please do not change the template headings"])
	w.writerow(["Date Should Be in YYYY-MM-DD Format"])
	
	
	w.writerow(["Employee ID", "Employee Name", "Employment Type", "Division", "Task ID", "Start Date", "End Date","Shift Type", "Bill Rate"])
	return w

def add_header_for_asset(w, args):
	
	w.writerow(["Notes:"])
	w.writerow(["Please do not change the template headings"])
	w.writerow(["Date Should Be in YYYY-MM-DD Format"])
	
	
	w.writerow(["Project","Asset Id","Asset Name", "Mobilization Start Date", "Mobilization End Date","Daily Cost","Daily Rate"])
	return w


def add_data(w, args):
	employees = get_active_employees(args)
	for employee in employees:
		row = [	employee.employee, employee.employee_name, employee.employment_type,employee.division,
				None, None , None, None, None ]
		w.writerow(row)
	return w

def add_data_asset(w, args):
	assets = get_is_equiprment_assets(args)
	for asset in assets:
		row = [None,asset.name,asset.asset_name,None,None,asset.daily_cost ,asset.daily_rate ]
		w.writerow(row)
	return w



def get_active_employees(args):
	sql = "SELECT employee,employee_name,employment_type,division FROM tabEmployee where docstatus < 2 and status = 'Active' and project_status='Standby'  and ifnull(company,0)=ifnull({0},0)and ifnull(branch,0)=ifnull({1},0) and ifnull(division,0)=ifnull({2},0) and ifnull(department,0)=ifnull({3},0)and ifnull(designation,0) = ifnull({4},0)".format(args["company"],args["branch"],args["division"],args["department"],args["designation"])
	# frappe.throw(str(sql))
	employees = frappe.db.sql(sql, as_dict=1)
	return employees

def get_is_equiprment_assets(args):
	sql ="select name,asset_name,(case when (select  modified_daily_cost from `tabAsset Price Changes Value` where asset= A.name order by creation desc limit 1) is null then daily_cost else (select  modified_daily_cost from `tabAsset Price Changes Value` where asset= A.name order by creation desc limit 1) end ) as daily_cost,(case when (select  modified_daily_rate from `tabAsset Price Changes Value` where asset= A.name order by creation desc limit 1) is null then daily_rate else (select  modified_daily_rate from `tabAsset Price Changes Value` where asset= A.name order by creation desc limit 1) end ) as daily_rate from `tabAsset` A  where A.is_equipment=1 and A.docstatus=1 and A.asset_status='Standby' and ifnull(company,0)=ifnull({0},0)and ifnull(department,0)=ifnull({1},0)".format(args["company"],args["department"])

	# frappe.throw(str(sql))
	assets = frappe.db.sql(sql, as_dict=1)
	return assets

	
@frappe.whitelist()
def freeze_message_with_time(t):
    time.sleep(int(t))
    return "done with"+t+"sec" 

# value of asset change 
@frappe.whitelist()
def assets_value(asset_name):
	value_list=[]
	asset_value="select modified_daily_cost,modified_daily_rate FROM `tabAsset Price Changes Value` where asset ='{0}' ORDER BY creation DESC LIMIT 1".format(asset_name)
	# frappe.throw(str(asset_value))
	asset_value_data=frappe.db.sql(asset_value,as_dict=1)
	if asset_value_data:
		for v in asset_value_data:
			daily_cost = v['modified_daily_cost']
			daily_rate = v['modified_daily_rate']
			value_list.append({'daily_cost':daily_cost,'daily_rate':daily_rate})
	else:
		asset = "select daily_cost,daily_rate from `tabAsset` where name = '{0}'" .format(asset_name)
		# frappe.throw(str(asset))	
		asset_data = frappe.db.sql(asset,as_dict=1)
		if asset_data:
			for i in asset_data:
				daily_cost = i['daily_cost']
				daily_rate = i['daily_rate']
				value_list.append({'daily_cost':daily_cost,'daily_rate':daily_rate})
				

	return value_list


	
























