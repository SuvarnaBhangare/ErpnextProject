CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `avuadmin`@`%` 
    SQL SECURITY DEFINER
VIEW `VATReport_Sales_GLEntry_Base` AS
    SELECT 
        `TGL`.`posting_date` AS `posting_date`,
        `TGL`.`name` AS `name`,
        `TGL`.`cost_center` AS `cost_center_GL`,
        `TSI`.`reference_name` AS `reference_name`,
        `TSI`.`reference_id` AS `reference_id`,
        `TSI`.`customer_name` AS `customer_name`,
        `TSI`.`customer_name_in_arabic` AS `customer_name_in_arabic`,
        `TC`.`name` AS `customer_name_master`,
        CASE
            WHEN `TSI`.`tax_id` IS NULL = 1 THEN `TC`.`tax_id`
            ELSE `TSI`.`tax_id`
        END AS `Customer_VATNo`,
        `TGL`.`docstatus` AS `docstatus`,
        `TGL`.`voucher_type` AS `voucher_type`,
        `TGL`.`voucher_no` AS `voucher_no`,
        `TGL`.`company` AS `company`,
        `TGL`.`is_advance` AS `is_advance`,
        `TGL`.`account` AS `account`,
        `TGL`.`debit` AS `debit`,
        `TGL`.`credit` AS `credit`,
        IFNULL(`STC`.`rate`, `A`.`tax_rate`) AS `vat_rate`,
        CASE
            WHEN `TGL`.`voucher_type` = 'Sales Invoice' THEN `TSI`.`nature`
            ELSE `TJE`.`nature`
        END AS `expense_account`,
        `TJE`.`cheque_no` AS `cheque_no`,
        CASE
            WHEN `TGL`.`voucher_type` = 'Sales Invoice' THEN `TSI`.`total`
            ELSE 0
        END AS `Amount`,
        CASE
            WHEN `TGL`.`debit` = 0 THEN - 1 * `TGL`.`credit`
            ELSE `TGL`.`debit`
        END AS `VAT_Amount`
    FROM
        ((((((`tabGL Entry` `TGL`
        LEFT JOIN `tabSales Invoice` `TSI` ON (`TGL`.`voucher_no` = `TSI`.`name`))
        LEFT JOIN `tabJournal Entry` `TJE` ON (`TGL`.`voucher_no` = `TJE`.`name`))
        LEFT JOIN `tabAccount` `A` ON (`TGL`.`account` = `A`.`name`))
        LEFT JOIN `tabCustomer` `TC` ON (`TSI`.`customer_name` = `TC`.`name`))
        LEFT JOIN `tabSales Taxes and Charges` `STC` ON (`TSI`.`name` = `STC`.`parent`
            AND `STC`.`account_head` LIKE '%VAT%'))
        LEFT JOIN `tabSales Invoice Item` `SII` ON (`TSI`.`name` = `SII`.`parent`))
    WHERE
        `TGL`.`docstatus` = 1
            AND `TGL`.`account` LIKE '%VAT%'