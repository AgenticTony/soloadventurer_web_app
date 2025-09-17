variable "project"       { type = string  default = "soloadventurer" }
variable "env"           { type = string  default = "dev" }
variable "aws_region"    { type = string }  # supplied by CI via TF_VAR_aws_region
variable "callback_urls" {
  type    = list(string)
  # add more later (Amplify preview / prod domains)
  default = ["http://localhost:3000"]
}
