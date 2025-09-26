package handlers

import (
	"context"
	"linkshortener/db"
	"linkshortener/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func CreateSpace(c *fiber.Ctx) error {
userID = c.Locals("userID").(primitive.ObjectID)
	var body struct {
Name string `json:"name"`
	}
	if err:=c.BodyParser(&body);err!=nil{
		return  c.Status(fiber.StatusBadRequest).JSON(fiber.Map("error":"invalid input"))
   }
	workspace:=models.Workspace{
		ID:primitive.NewObjectID()
		Name:body.Name
		CreatedBy: userID,
		CreatedAt: time.Now(),
	}
	coll:=db.GetCollection("workspaces")
	_err:=coll.InsertOne(context.TODO(),workspace)
	if err!=nil{
	 return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map("error":"Failed to create  the workspace"))
	}
	member:= models.WorkspaceMember{
		ID:primitive.NewObjectID()
		WorkspaceID: workspace.ID,
		UserID: userId,
		Role: "owner",
		JoinedAt: time.Now(),
	}
	memberColl:=db.GetCollection("workspace_members")
	_,err:=memberColl.InsertOne(context.TODO(),member)
	err!=nil{
		return  c.Status(fiber.StatusInternalServerError).JSON(fiber.Map("error":"Failed to create workspace member"))
	}
 return c.JSON(workspace)
}
func  GetSpaces(c *fiber.Ctx)error{
	userID:=c.Locals("userID").(primitive.ObjectID)
	 membercoll:=db.GetCollection("workspace_members")
	cursor,err:=membercoll.Find(context.TODO(),bson.M{"user_id":userID})
     if err!=nil{
return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Invalid response"})
	}
	defer  cursor.Close(context.TODO())
	var  memberships []models.WorkspaceMember
	if err:=cursor.All(context.TODO(),&memberships);err!=nil{
		return  c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to fetch the membershipa"})
	}
	id:=make([]primitive.ObjectID,len(memberships))
	for  i,m:=range memberships{
      id[i] = m.WorkspaceID
	}
	workspaceColl:=db.GetCollection("workspaces")
	cursor,err:=workspaceColl.Find(context.TODO(),bson.M{"_id":bson.M{"$in":ids}})
	if err!=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to fetch workspaces"})
	}
	defer cursor.Close(context.TODO())

var workspaces []models.Workspace
	if err := cursor.All(context.TODO(), &workspaces); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to parse workspaces"})
	}

	return c.JSON(workspaces)
}
func SpaceDetail(c *fiber.Ctx) error {
	workspaceID,err:=primitive.ObjectIDFromHex(c.Params("id"))
     if err!=nil{
return  c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error":"Invalid workspace ID"})
	}
	WorkspaceColl:=db.GetCollection("workspaces")
	var workspace  models.Workspace
	if err:=WorkspaceColl.FindOne(context.TODO(),bson.M{"_id":workspaceID}).Decode(&workspace);err!=nil{
		return  c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Couldn't find the valid workspace"})   
	}
	memberColl:=db.GetCollection("workspace_members")
	cursor,err:=memberColl.Find(context.TODO(),bson.M{"workspace_id":workspaceID})
	if  err!=nil{
		return  c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to fetch the members"})
	}
	defer cursor.Close(context.TODO())
	var members []models.WorkspaceMember
	if err:=cursor.All(context.TODO(),&members);err!=nil{
    return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to parse the number"})
	}
	return c.JSON(fiber.Map{
       "workspace":workspace
		"members":members
	})
}
/////////////////////
func InviteMember(c *fiber.Ctx) error {
	workspaceID:= primitive.ObjectIDFromHex(c.Params("id"))
	if err!=nil{
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error":"Invalid Workspace ID"})
	}
	var body struct{
UserID string `json:"user_id"`
	}
	if err:=c.BodyParser(&body);err!=nil{
       return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error":"Invalid bad request"})
	}
}
/////////////////////////////
func AcceptInvite(c *fiber.Ctx) error {
	token := c.Params("token")
	userID := c.Locals("userID").(primitive.ObjectID) 

	inviteColl := db.GetCollection("workspace_invites")
	var invite models.WorkspaceInvite
	err := inviteColl.FindOne(context.TODO(), bson.M{"token": token, "status": "pending"}).Decode(&invite)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid or expired invite"})
	}

	if time.Now().After(invite.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invite expired"})
	}

	userEmail := c.Locals("userEmail").(string)
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

func UpdateRole(c *fiber.Ctx) error {
	workspaceID,_:= primitive.ObjectIDFromHex(c.Params("id"))
 userID,_:=primitive.ObjectIDFromHex(c.Params("userId"))
var body struct{
Role string `json:"role"`
}
	memberCOll:=db.GetCollection("workspace_members")
	_,err:=memberCOll.UpdateOne(context.TODO(),bson.M{"workspace_id":workspaceID,"user_id:":userID},bson.M{"$set":bson.M{"role":body.Role}})
if err!=nil{
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to update the role"})

	}
	return c.JSON(fiber.Map{"message":"Role Updated"})
}
func RemoveMember(c *fiber.Ctx) error {

	workspaceID,_:=primitive.ObjectIDFromHex(c.Params("id"))
	userID,_:=primitive.ObjectIDFromHex(c.Params("userId"))
	memberColl:=db.GetCollection("workspace_members")
	_err:=memberColl.DeleteOne(context.TODO(),bson.M{"workspace_id":workspaceID,"user_id":userID})
	if err!=nil{
      return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error":"Failed to delete the Member"})
	}
	return c.JSON(fiber.Map{
       "message":"Member Removed"
	})
    }











