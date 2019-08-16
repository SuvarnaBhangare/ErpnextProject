CREATE DEFINER=`avuadmin`@`%` PROCEDURE `Fleets_Wise_Report`()
BEGIN
	select * from(  
  select ifnull(veh_name,'Total') as '01#Truck No:Link/Vehicle:105',if(invoice_no is null,null,owner) as '03#Entry By::130',ifnull(invoice_no,'Sub Total') as '02#Invoice No::140',if(invoice_no is null,null,voucher_type) as '04#Voucher_type::110',
  if(invoice_no is null,null,account) as '05#Account:Link/Account:220',debit_amt as '06#Debit Amount:Currency:130', credit_amt as '07#Credit Amount:Currency:130',(debit_amt - credit_amt) as '08#Balance Amount:Currency:130',
  case when invoice_no is not null then 1 else 0 end as 'indent'
  from
  (select V.name as 'veh_name' ,EC.owner,EC.parent as 'invoice_no',
    'Purchase Invoice' as 'voucher_type',
    PII.expense_account as 'Account',PII.base_net_amount as 'debit_amt',
    0.00 as 'credit_amt'
    from `tabPurchase Invoice Item` PII 
    left join `tabPurchase Invoice` PI on PI.name = PII.parent
    left join(
    	select It.name  as it_name, V.name as veh_name from `tabItem` It 
    	left join `tabAsset` A on A.item_code = It.name 
    	left join `tabVehicle` V on V.asset_id = A.name
    	) veh_lov on veh_lov.it_name = PII.item_code
    where veh_lov.veh_name is not null  
    	

    union all

    select veh_lov.veh_name ,SII.owner, SI.name as 'invoice_no',
    'Sales Invoice' as 'voucher_type',
    SII.expense_account as 'Account',0.00 as 'debit_amt',
    SII.base_net_amount as 'credit_amt' 
    from `tabSales Invoice Item` SII
    left join `tabSales Invoice` SI on SI.name = SII.parent
    left join(
    	select It.name  as it_name, V.name as veh_name from `tabItem` It 
    	left join `tabAsset` A on A.item_code = It.name 
    	left join `tabVehicle` V on V.asset_id = A.name
    	) veh_lov on veh_lov.it_name = SII.item_code
    where veh_lov.veh_name is not null  	
  )veh_detail group by veh_name,invoice_no  With  ROLLUP 
)sort_detail order by `01#Truck No:Link/Vehicle:105`,`02#Invoice No::140` desc ;
END