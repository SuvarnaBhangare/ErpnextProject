CREATE DEFINER=`avuadmin`@`%` PROCEDURE `Fleets_Wise_Report`(p_company varchar(300),p_start_date varchar(300),p_end_date varchar(300),p_cost_center varchar(200),p_project varchar(200), p_veh_no varchar(200))
BEGIN

set @sql = concat('
select * from (
	select ifnull(vehicle_no,\'Total\') as `01#Truck No:Link/Vehicle:105`,
		if(vehicle_no is not null,case 
			when account is null then \'<b>Total Vehicle-Wise</b>\' 
            else account end ,account) as `02#Account:Link/Account:180`, 
		if(account is not null,case 
			when voucher_type is null then \'<b>Total Account-Wise</b>\' 
            else voucher_type end ,voucher_type) as `03#Voucher Type::200`, 
		if(voucher_type is not null,case 
			when voucher_no is null then \'<b>Total Voucher-Wise</b>\'
            else voucher_no end ,voucher_no) as `04#Invoice No::140`, 
		
        -- ifnull(voucher_type,`Account-Wise Total`) as `04#Voucher_type::110`,
		-- ifnull(voucher_no,`VoucherNo-Wise Total`) as `02#Invoice No::140`, 
        -- ifnull(voucher_date,`Voucher Date-Wise Total`) as voucher_date,
		if(voucher_no is null,null,entry_by) as `05#Entry By::130`,
		sum(debit_amt) as `06#Debit Amount:Currency:130`,sum(credit_amt) as `07#Credit Amount:Currency:130`,
		sum(debit_amt-credit_amt) as `08#Balance Amount:Currency:130`,
        case when account is null then 0 else 1 end as `indent`
		 -- case when voucher_no is not null then 1 else 0 end as `indent`
		from
		(select V.name as `vehicle_no` ,EC.owner as `entry_by`,EC.parent as `voucher_no`,EC.expense_account as `account`,
			EC.expense_amount as `debit_amt`,0.00 as `credit_amt` ,\'Expense Voucher Entry\' as `voucher_type`, 
			EC.voucher_date 
			from `tabExpense Voucher Entry Child` EC
			left join `tabVehicle` V on V.asset_id = EC.asset
			-- left join `tabExpense Voucher Entry`E on E.name = EC.parent
			where V.name is not null 
            and EC.docstatus=1
            and
             (case when ',"'p_veh_no'",' is not null then V.name in (',p_veh_no,') else 1=1 end)
            
            -- if(',p_veh_no,'!=null,V.name in (',p_veh_no,'),1)=1
            
            and EC.company = ',p_company,'
            and EC.voucher_date between ',p_start_date,' and ',p_end_date,'
            and ifnull(EC.cost_center,0) = ifnull(',p_cost_center,',ifnull(EC.cost_center,0))
			and ifnull(EC.project,0) = ifnull(',p_project,',ifnull(EC.project,0))
            
			

			union all

			select TCI.vehicle as `vehicle_no`, TCI.owner as `entry_by`,TCI.parent as `voucher_no`,
			IT.income_account as `account`,0.00 as `debit_amt` ,TCI.net_amount as `credit_amt` ,
			\'Transport Contract Invoice\' as `voucher_type`,TC.invoice_date 
			from `tabTransport Contract Invoice Details` TCI
			left join `tabTransport Contract Invoice` TC on TC.name= TCI.parent
			left join `tabInvoice Type` IT on IT.company = TC.company and IT.abbr = \'T\'
			left join `tabVehicle` V on V.name = TCI.vehicle
			where V.name is not null
            and TCI.docstatus=1
            and
           (case when ',"'p_veh_no'",' is not null then TCI.vehicle in (',p_veh_no,') else 1=1 end)
           -- if(',p_veh_no,'!=null,TCI.vehicle in (',p_veh_no,'),1)=1
        
            and TC.company =',p_company,'
            and TC.invoice_date  between ',p_start_date,' and ',p_end_date,'
            and ifnull(TC.cost_center,0) = ifnull(',p_cost_center,',ifnull(TC.cost_center,0))
			and ifnull(TC.project_id,0) = ifnull(',p_project,',ifnull(TC.project_id,0))

			
		) veh_details group by vehicle_no ,account,voucher_type,voucher_no  With  ROLLUP 

)sort_detail order by `01#Truck No:Link/Vehicle:105`,`02#Account:Link/Account:180` asc,`03#Voucher Type::200` , `04#Invoice No::140`  desc
 ');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
END