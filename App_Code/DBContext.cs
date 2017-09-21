﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using Dapper;
using Dapper.Contrib.Extensions;

/// <summary>
/// Summary description for DBContext
/// </summary>
public class DBContext : IDisposable
{
    private readonly IDbConnection iDbConnection = null;
    public DBContext() : this(ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString)
        {
    }

    public DBContext(string astrConnectionString)
    {
        iDbConnection = new SqlConnection(astrConnectionString);
    }

    public void Dispose()
    {
        iDbConnection.Close();
    }

    public long SaveRegistration(Registration reg)
    {
        return iDbConnection.Insert(reg);
    }

    public IEnumerable<Registration> GetRecords(string startDate, string endDate)
    {
        string query =
            @"select convert(varchar(10),CreatedDate,101) as CreatedDate,[RegId]
      ,[FirstName]
      ,[LastName]
      ,[Address]
      ,[City]
      ,[State]
      ,[Zipcode]
      ,[Email]
      ,[MobileNumber]
      ,[WarrantySlno]
      ,[PurchaseDate]
      ,[PurchaseReceiptFile]
       from registration(NOLOCK) where CreatedDate between @startdate and @enddate";

        IEnumerable<Registration> result = iDbConnection.Query<Registration>(query, new {startdate=startDate + " 00:00:00",enddate=endDate + " 23:59:00"});
        return result;
    }

    public bool IsSerialNumberExist(string serialno, out string message)
    {
        message = string.Empty;
        //check whether serial number is valid.
        bool isExist = iDbConnection.ExecuteScalar<bool>("select count(1) from IssuedSerialNumbers(NOLOCK) where Serial_Number = @slno", new { slno = serialno });
        if (isExist)
        {
            //check whetehr serialno is already registered
            bool isRegistered = iDbConnection.ExecuteScalar<bool>("select count(1) from Registration(NOLOCK) where WarrantySlno = @slno", new { slno = serialno });
            if (isRegistered)
            {
                message = "Serial Number is already registered";
            }
        }
        else
        {
            message = "Incorrect Serial Number.";
        }
        return isExist;
    }
}