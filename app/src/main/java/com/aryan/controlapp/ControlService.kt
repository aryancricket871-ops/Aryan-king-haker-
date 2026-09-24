package com.aryan.controlapp

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import com.google.firebase.database.*

class ControlService : AccessibilityService() {
    override fun onServiceConnected() {
        super.onServiceConnected()

        FirebaseDatabase.getInstance().reference.child("devices").child("child_phone").child("command").addValueEventListener(object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                if (snapshot.exists()) {
                    val x = snapshot.child("x").getValue(Float::class.java) ?: 0f
                    val y = snapshot.child("y").getValue(Float::class.java) ?: 0f
                    
                    if (x > 0f && y > 0f) {
                        val p = Path().apply { moveTo(x, y) }
                        val stroke = GestureDescription.StrokeDescription(p, 0, 100)
                        dispatchGesture(GestureDescription.Builder().addStroke(stroke).build(), null, null)
                    }
                }
            }
            override fun onCancelled(error: DatabaseError) {}
        })
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
