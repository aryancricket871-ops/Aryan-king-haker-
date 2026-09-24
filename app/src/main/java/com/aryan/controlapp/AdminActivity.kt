package com.aryan.controlapp

import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.database.FirebaseDatabase

class AdminActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin)

        val statusText = findViewById<TextView>(R.id.statusText)
        val btnConnect = findViewById<Button>(R.id.btnConnect)

        btnConnect.setOnClickListener {
            statusText.text = "Sending request..."
            btnConnect.isEnabled = false

            FirebaseDatabase.getInstance().reference.child("devices").child("child_phone").child("admin_status").setValue("Connected").addOnSuccessListener {
                statusText.text = "Status: Connected (Online)"
                statusText.setTextColor(Color.GREEN)
                btnConnect.text = "Monitoring Active"
            }
        }
    }
}
