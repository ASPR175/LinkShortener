package handlers

import (
	"context"
	"fmt"
	"linkshortener/db"
	"linkshortener/models"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/resend/resend-go/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func CreateSpace(c *fiber.Ctx) error {

	claims := c.Locals("user").(jwt.MapClaims)
	userIDHex := claims["user_id"].(string)

	userID, err := primitive.ObjectIDFromHex(userIDHex)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user id"})
	}

	var body struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Can not create space"})
	}

	workspace := models.Workspace{
		ID:        primitive.NewObjectID(),
		Name:      body.Name,
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}
	coll := db.GetCollection("workspaces")

	_, err = coll.InsertOne(context.TODO(), workspace)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to create workspace"})
	}
	member := models.WorkspaceMember{
		ID:          primitive.NewObjectID(),
		WorkspaceID: workspace.ID,
		UserID:      userID,
		Role:        "owner",
		JoinedAt:    time.Now(),
	}
	memberColl := db.GetCollection("workspace_members")
	_, err = memberColl.InsertOne(context.TODO(), member)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create workspace member"})
	}
	// return c.JSON(fiber.Map{
	// 	"workspace": workspace,
	// 	"member":    member,
	// })
	return c.JSON(fiber.Map{
		"workspace": fiber.Map{
			"_id":        workspace.ID.Hex(),
			"name":       workspace.Name,
			"created_by": workspace.CreatedBy.Hex(),
			"created_at": workspace.CreatedAt,
		},
		"member": fiber.Map{
			"_id":          member.ID.Hex(),
			"workspace_id": member.WorkspaceID.Hex(),
			"user_id":      member.UserID.Hex(),
			"role":         member.Role,
			"joined_at":    member.JoinedAt,
		},
	})
}
func GetSpaces(c *fiber.Ctx) error {

	claims, ok := c.Locals("user").(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid user claims"})
	}

	userIDStr, ok := claims["user_id"].(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid user ID in claims"})
	}

	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid user ID format"})
	}

	membercoll := db.GetCollection("workspace_members")
	cursor, err := membercoll.Find(context.TODO(), bson.M{"user_id": userID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Invalid response"})
	}
	defer cursor.Close(context.TODO())

	var memberships []models.WorkspaceMember
	if err := cursor.All(context.TODO(), &memberships); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch memberships"})
	}

	ids := make([]primitive.ObjectID, len(memberships))
	for i, m := range memberships {
		ids[i] = m.WorkspaceID
	}

	workspaceColl := db.GetCollection("workspaces")
	cursor, err = workspaceColl.Find(context.TODO(), bson.M{"_id": bson.M{"$in": ids}})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch workspaces"})
	}
	defer cursor.Close(context.TODO())

	var workspaces []models.Workspace
	if err := cursor.All(context.TODO(), &workspaces); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse workspaces"})
	}

	var workspaceList []fiber.Map
	for _, w := range workspaces {
		workspaceList = append(workspaceList, fiber.Map{
			"_id":        w.ID.Hex(),
			"name":       w.Name,
			"created_by": w.CreatedBy.Hex(),
			"created_at": w.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"workspaces": workspaceList,
	})
}

func SpaceDetail(c *fiber.Ctx) error {
	workspaceID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid workspace ID"})
	}

	WorkspaceColl := db.GetCollection("workspaces")
	var workspace models.Workspace
	if err := WorkspaceColl.FindOne(context.TODO(), bson.M{"_id": workspaceID}).Decode(&workspace); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Couldn't find the valid workspace"})
	}

	memberColl := db.GetCollection("workspace_members")
	memberCursor, err := memberColl.Find(context.TODO(), bson.M{"workspace_id": workspaceID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch members"})
	}
	defer memberCursor.Close(context.TODO())
	var members []models.WorkspaceMember
	if err := memberCursor.All(context.TODO(), &members); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse members"})
	}

	linkColl := db.GetCollection("links")
	linkCursor, err := linkColl.Find(context.TODO(), bson.M{"workspace_id": workspaceID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch links"})
	}
	defer linkCursor.Close(context.TODO())
	var links []models.Link
	if err := linkCursor.All(context.TODO(), &links); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to parse links"})
	}

	var membersList []fiber.Map
	for _, m := range members {
		membersList = append(membersList, fiber.Map{
			"_id":          m.ID.Hex(),
			"workspace_id": m.WorkspaceID.Hex(),
			"user_id":      m.UserID.Hex(),
			"role":         m.Role,
			"joined_at":    m.JoinedAt,
		})
	}

	var linksList []fiber.Map
	for _, l := range links {
		linksList = append(linksList, fiber.Map{
			"_id":          l.ID.Hex(),
			"short_id":     l.ShortID,
			"original":     l.Original,
			"clicks":       l.Clicks,
			"workspace_id": l.WorkspaceID.Hex(),
			"created_at":   l.CreatedAt,
			"updated_at":   l.UpdatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"workspace": fiber.Map{
			"_id":        workspace.ID.Hex(),
			"name":       workspace.Name,
			"created_by": workspace.CreatedBy.Hex(),
			"created_at": workspace.CreatedAt,
		},
		"members": membersList,
		"links":   linksList,
	})

}

// ///////////////////
func InviteMember(c *fiber.Ctx) error {
	// Extract user info from JWT claims
	claims := c.Locals("user").(jwt.MapClaims)
	userID, err := primitive.ObjectIDFromHex(claims["id"].(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user id"})
	}

	workspaceID, err := primitive.ObjectIDFromHex(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid workspace id"})
	}

	var body struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&body); err != nil || body.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "email required"})
	}

	token := primitive.NewObjectID().Hex()
	now := time.Now()

	invite := models.WorkspaceInvite{
		ID:          primitive.NewObjectID(),
		WorkspaceID: workspaceID,
		Email:       body.Email,
		Role:        "member",
		Token:       token,
		Status:      "pending",
		InvitedBy:   userID,
		CreatedAt:   now,
		ExpiresAt:   now.Add(48 * time.Hour),
	}

	coll := db.GetCollection("workspace_invites")
	_, err = coll.InsertOne(context.TODO(), invite)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save invite"})
	}

	inviteLink := fmt.Sprintf(os.Getenv("FRONTEND_URL")+"/join?token=%s", token)
	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	params := &resend.SendEmailRequest{
		From:    "Workspace Invites <no-reply@xyz.com>",
		To:      []string{body.Email},
		Subject: "You’ve been invited to a workspace",
		Html:    fmt.Sprintf("<p>You’ve been invited to join a workspace. <a href='%s'>Accept Invite</a></p>", inviteLink),
	}

	_, err = client.Emails.SendWithContext(context.TODO(), params)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "failed to send email"})
	}

	return c.JSON(fiber.Map{"message": "invite sent", "email": body.Email})
}

// ///////////////////////////
func AcceptInvite(c *fiber.Ctx) error {
	claims := c.Locals("user").(jwt.MapClaims)
	userID, err := primitive.ObjectIDFromHex(claims["id"].(string))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid user id"})
	}
	userEmail := claims["email"].(string)

	token := c.Params("token")
	inviteColl := db.GetCollection("workspace_invites")

	var invite models.WorkspaceInvite
	err = inviteColl.FindOne(context.TODO(), bson.M{"token": token, "status": "pending"}).Decode(&invite)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid or expired invite"})
	}

	if time.Now().After(invite.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invite expired"})
	}

	if invite.Email != userEmail {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "invite not for this email"})
	}

	memberColl := db.GetCollection("workspace_members")
	_, err = memberColl.InsertOne(context.TODO(), models.WorkspaceMember{
		ID:          primitive.NewObjectID(),
		WorkspaceID: invite.WorkspaceID,
		UserID:      userID,
		Role:        invite.Role,
		JoinedAt:    time.Now(),
	})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to add member"})
	}

	_, _ = inviteColl.UpdateOne(context.TODO(),
		bson.M{"_id": invite.ID},
		bson.M{"$set": bson.M{"status": "accepted"}},
	)

	return c.JSON(fiber.Map{"message": "joined workspace"})
}

func ResendInvite(c *fiber.Ctx) error {
	inviteID, err := primitive.ObjectIDFromHex(c.Params("inviteId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid invite id"})
	}

	inviteColl := db.GetCollection("workspace_invites")

	var invite models.WorkspaceInvite
	err = inviteColl.FindOne(context.TODO(), bson.M{"_id": inviteID}).Decode(&invite)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "invite not found"})
	}

	now := time.Now()
	update := bson.M{
		"$set": bson.M{
			"expires_at": now.Add(48 * time.Hour),
			"created_at": now,
			"status":     "pending",
		},
	}
	_, err = inviteColl.UpdateByID(context.TODO(), inviteID, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update invite"})
	}

	inviteLink := fmt.Sprintf(os.Getenv("FRONTEND_URL")+"/join?token=%s", invite.Token)

	client := resend.NewClient(os.Getenv("RESEND_API_KEY"))

	params := &resend.SendEmailRequest{
		From:    "Workspace Invites <no-reply@xyz.com>",
		To:      []string{invite.Email},
		Subject: "Your workspace invite has been resent",
		Html:    fmt.Sprintf("<p>You’ve been invited again! <a href='%s'>Click here to join</a></p>", inviteLink),
	}

	_, err = client.Emails.SendWithContext(context.TODO(), params)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "failed to resend email"})
	}

	return c.JSON(fiber.Map{
		"message": "invite resent",
		"email":   invite.Email,
		"link":    inviteLink,
	})
}

// //////////////////////////////////////
func UpdateRole(c *fiber.Ctx) error {
	workspaceID, _ := primitive.ObjectIDFromHex(c.Params("id"))
	userID, _ := primitive.ObjectIDFromHex(c.Params("userId"))

	var body struct {
		Role string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil || body.Role == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Role required"})
	}

	memberColl := db.GetCollection("workspace_members")
	_, err := memberColl.UpdateOne(
		context.TODO(),
		bson.M{"workspace_id": workspaceID, "user_id": userID},
		bson.M{"$set": bson.M{"role": body.Role}},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update the role"})
	}

	return c.JSON(fiber.Map{"message": "Role Updated"})
}

func RemoveMember(c *fiber.Ctx) error {

	workspaceID, _ := primitive.ObjectIDFromHex(c.Params("id"))
	userID, _ := primitive.ObjectIDFromHex(c.Params("userId"))
	memberColl := db.GetCollection("workspace_members")
	_, err := memberColl.DeleteOne(context.TODO(), bson.M{"workspace_id": workspaceID, "user_id": userID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete the Member"})
	}
	return c.JSON(fiber.Map{
		"message": "Member Removed",
	})
}
