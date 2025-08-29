"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, Home, User, MessageSquare, DollarSign, CheckCircle, XCircle } from "lucide-react"

interface Notification {
  id: string
  type: "rental_request" | "request_response" | "payment" | "complaint" | "tenant_update" | "new_property"
  title: string
  message: string
  time: string
  read: boolean
  data?: any
}

interface NotificationCenterProps {
  userType: "student" | "landlord"
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onHandleRequest?: (requestId: string, action: "accept" | "reject", reason?: string) => void
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "rental_request":
      return <Home className="w-4 h-4 text-blue-500" />
    case "request_response":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "payment":
      return <DollarSign className="w-4 h-4 text-green-500" />
    case "complaint":
      return <MessageSquare className="w-4 h-4 text-red-500" />
    case "tenant_update":
      return <User className="w-4 h-4 text-orange-500" />
    case "new_property":
      return <Home className="w-4 h-4 text-purple-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

export default function NotificationCenter({
  userType,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onHandleRequest,
}: NotificationCenterProps) {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    setSelectedNotification(notification)
  }

  const handleRequestAction = (action: "accept" | "reject") => {
    if (selectedNotification && onHandleRequest) {
      onHandleRequest(selectedNotification.data?.requestId, action, rejectionReason)
      setSelectedNotification(null)
      setRejectionReason("")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedNotification && getNotificationIcon(selectedNotification.type)}
              <span>{selectedNotification?.title}</span>
            </DialogTitle>
            <DialogDescription>{selectedNotification?.time}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">{selectedNotification?.message}</p>

            {/* Rental Request Actions for Landlords */}
            {selectedNotification?.type === "rental_request" && userType === "landlord" && (
              <div className="space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Student Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {selectedNotification.data?.studentName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedNotification.data?.studentEmail}
                    </p>
                    <p>
                      <strong>University:</strong> {selectedNotification.data?.university}
                    </p>
                    <p>
                      <strong>Year:</strong> {selectedNotification.data?.yearOfStudy}
                    </p>
                  </div>
                </div>
                {selectedNotification.data?.message && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Message from Student</h4>
                    <p className="text-sm">{selectedNotification.data.message}</p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button onClick={() => handleRequestAction("accept")} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRequestAction("reject")}
                    className="flex-1 bg-transparent"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rejection reason (optional)</label>
                  <textarea
                    className="w-full min-h-[60px] p-2 border border-border rounded-md resize-none text-sm"
                    placeholder="Provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Request Response for Students */}
            {selectedNotification?.type === "request_response" && userType === "student" && (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg ${
                    selectedNotification.data?.status === "accepted" ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {selectedNotification.data?.status === "accepted" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`font-medium ${
                        selectedNotification.data?.status === "accepted" ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      Request {selectedNotification.data?.status === "accepted" ? "Accepted" : "Rejected"}
                    </span>
                  </div>
                </div>
                {selectedNotification.data?.reason && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Landlord's Message</h4>
                    <p className="text-sm">{selectedNotification.data.reason}</p>
                  </div>
                )}
                {selectedNotification.data?.status === "accepted" && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Congratulations! The landlord will contact you soon with next steps.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
