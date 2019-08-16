from __future__ import unicode_literals
import frappe
from frappe.utils import cstr, add_days, date_diff
from frappe import _

def employe_list():
    employee = "select name from tabEmployee where project_status ='Mobilized'"
    employee_list=frappe.db.sql(employee,as_list=1)
    # frappe.throw(str(employee))
    return employee_list



def emp_all_project(employee):
    result=None
    all_project_sql="SELECT if(end_date < sysdate() , employee , null) as employee FROM `tabUpload Mobilization Data` where employee = '{0}' order by end_date desc limit 1".format(employee)
    
    all_project=frappe.db.sql(all_project_sql,as_dict=1)
    # frappe.throw(str(all_project_sql))
    if all_project:
        result=all_project[0]
        # frappe.msgprint(str(result))
    return result

def asset_list():
    asset = "SELECT name  FROM `tabAsset` where asset_status='Mobilized'"
    asset_list=frappe.db.sql(asset,as_list=1)
    return asset_list 

def mobilized_asset(asset):
    result1=None
    all_project_asset_sql="SELECT if(mobilization_end_date < sysdate() , asset_id , null) as asset_id FROM `tabAsset Mobilization` where asset_id = '{0}' order by mobilization_end_date desc limit 1".format(asset)
    # frappe.msgprint(str(all_project_asset_sql))
    all_project_asset=frappe.db.sql(all_project_asset_sql,as_dict=1)
    # frappe.throw(str(all_project_asset))
    if all_project_asset:
        result1=all_project_asset[0]
        # frappe.msgprint(str(result))
    return result1

def update_employe_status(name):
    frappe.client.set_value("Employee", name , {'project_status': 'Standby'})

def update_asset_status(name):
    frappe.client.set_value("Asset", name , {'asset_status': 'Standby'})


# def update_status(name,filters):
#     filter ={"disabled" : 0}
#     return frappe.get_all("Asset", fields=["name"], filters=filters)



@frappe.whitelist()
def schedule_emp():
    for name in employe_list():
        # frappe.msgprint("name"+str(name[0]))
        d=emp_all_project(name[0])
        # frappe.msgprint(str(d))
        if d['employee'] is not None:
            # frappe.msgprint(str(d["employee"]))
            # for j in emp_all_project(name[0]):
            #     employee_name = emp_all_project(name[0])[0]["employee"]
            #     frappe.msgprint(str(employee_name))
            update_employe_status(d["employee"])

# @frappe.whitelist()
# def schedule_emp(doc,end_date):
#     for name in employe_list():
#         frappe.msgprint(str(name))
#         if emp_all_project(name[0]):
#             d=emp_all_project(name[0])
#             frappe.throw(str(end_date))
#             frappe.msgprint(str(d))
#             frappe.msgprint('in')
#             # update_employe_status(name[0])        
 
        
@frappe.whitelist()
def schedule_asset():
    for name in asset_list():
        # frappe.msgprint(str(name[0]))
        asset = mobilized_asset(name[0])
        if asset['asset_id'] is not None:
            # frappe.msgprint(asset['asset_id'])
            update_asset_status(name[0])
                

